import assert from "node:assert/strict";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const installScript = new URL("../public/install.sh", import.meta.url);
const releaseBase =
  "https://github.com/AstralSightStudios/AstroBox-NG/releases/download/v2.2.0";

function runInstaller({
  packageManager,
  expectedUrl,
  expectedInstall,
  os = "Linux",
  arch = "x86_64",
  abortDownload = false,
  expectedStatus = 0,
}) {
  const root = mkdtempSync(join(tmpdir(), "astrobox-installer-test-"));
  const bin = join(root, "bin");
  const downloadLog = join(root, "download.log");
  const installLog = join(root, "install.log");
  mkdirSync(bin);

  for (const utility of ["mktemp", "rm"]) {
    const source = utility === "rm" ? "/bin/rm" : "/usr/bin/mktemp";
    symlinkSync(source, join(bin, utility));
  }

  const command = (name, content) => {
    const file = join(bin, name);
    writeFileSync(file, content);
    chmodSync(file, 0o755);
  };

  command(
    "uname",
    '#!/bin/sh\ncase "$1" in -s) echo "$TEST_OS" ;; -m) echo "$TEST_ARCH" ;; esac\n',
  );
  command(
    "curl",
    '#!/bin/sh\nout=\nurl=\nwhile [ "$#" -gt 0 ]; do\n  case "$1" in\n    -o) out=$2; shift 2 ;;\n    -*) shift ;;\n    *) url=$1; shift ;;\n  esac\ndone\nprintf "%s\\n" "$url" > "$DOWNLOAD_LOG"\nif [ "$ABORT_DOWNLOAD" = true ]; then exit 42; fi\n: > "$out"\n',
  );
  command(
    "sudo",
    '#!/bin/sh\nprintf "%s\\n" "$*" >> "$INSTALL_LOG"\n',
  );
  if (packageManager) command(packageManager, "#!/bin/sh\nexit 0\n");

  try {
    const result = spawnSync("/bin/bash", [installScript.pathname, "-y"], {
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: bin,
        TEST_OS: os,
        TEST_ARCH: arch,
        ABORT_DOWNLOAD: String(abortDownload),
        DOWNLOAD_LOG: downloadLog,
        INSTALL_LOG: installLog,
      },
    });

    assert.equal(result.status, expectedStatus, result.stderr || result.stdout);
    assert.equal(readFileSync(downloadLog, "utf8").trim(), expectedUrl);
    if (expectedInstall) {
      assert.ok(
        readFileSync(installLog, "utf8").includes(expectedInstall),
        `Expected installer command ${expectedInstall}`,
      );
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("downloads the v2.2.0 Debian package", () => {
  runInstaller({
    packageManager: "apt-get",
    expectedUrl: `${releaseBase}/AstroBox-2.2.0_amd64.deb`,
    expectedInstall: "dpkg -i",
  });
});

test("downloads the v2.2.0 RedHat package", () => {
  runInstaller({
    packageManager: "dnf",
    expectedUrl: `${releaseBase}/AstroBox-2.2.0_x86_64.rpm`,
    expectedInstall: "dnf install -y",
  });
});

test("downloads and installs the v2.2.0 Arch package", () => {
  runInstaller({
    packageManager: "pacman",
    expectedUrl: `${releaseBase}/AstroBox-2.2.0-1_x86_64.pkg.tar.zst`,
    expectedInstall: "pacman -U --noconfirm",
  });
});

test("downloads the v2.2.0 Apple Silicon macOS package", () => {
  runInstaller({
    expectedUrl: `${releaseBase}/AstroBox_2.2.0_aarch64.dmg`,
    os: "Darwin",
    arch: "arm64",
    abortDownload: true,
    expectedStatus: 42,
  });
});

test("downloads the v2.2.0 Intel macOS package", () => {
  runInstaller({
    expectedUrl: `${releaseBase}/AstroBox_2.2.0_x64.dmg`,
    os: "Darwin",
    arch: "x86_64",
    abortDownload: true,
    expectedStatus: 42,
  });
});
