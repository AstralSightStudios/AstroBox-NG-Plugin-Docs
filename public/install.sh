#!/usr/bin/env bash
# AstroBox NG 2.0.0 installer for Linux & macOS

set -euo pipefail

REPO="AstralSightStudios/AstroBox-NG"
VERSION="2.0.0"
RELEASE_URL="https://github.com/${REPO}/releases/download/${VERSION}"

OS=$(uname -s)
ARCH=$(uname -m)

# Normalize architecture
 case "${ARCH}" in
    x86_64|amd64)
        ARCH="x86_64"
        ;;
    aarch64|arm64)
        ARCH="arm64"
        ;;
    *)
        echo "Unsupported architecture: ${ARCH}"
        exit 1
        ;;
esac

# Normalize OS and pick package
 case "${OS}" in
    Linux)
        if [[ "${ARCH}" == "arm64" ]]; then
            echo "Sorry, AstroBox NG ${VERSION} does not provide an ARM64 Linux package yet."
            exit 1
        fi

        if command -v apt-get &>/dev/null || command -v dpkg &>/dev/null; then
            PKG="AstroBox_${VERSION}_amd64.deb"
            INSTALLER=(sudo dpkg -i)
            POST_INSTALL=(sudo apt-get install -f -y)
        elif command -v dnf &>/dev/null || command -v yum &>/dev/null || command -v rpm &>/dev/null; then
            PKG="AstroBox_${VERSION}_x86_64.rpm"
            if command -v dnf &>/dev/null; then
                INSTALLER=(sudo dnf install -y)
            elif command -v yum &>/dev/null; then
                INSTALLER=(sudo yum install -y)
            else
                INSTALLER=(sudo rpm -i)
            fi
            POST_INSTALL=()
        elif command -v pacman &>/dev/null; then
            PKG="AstroBox_${VERSION}_x86_64.pkg.tar.zst"
            INSTALLER=(sudo pacman -U --noconfirm)
            POST_INSTALL=()
        else
            echo "No supported package manager found (apt/dpkg, dnf/yum/rpm, or pacman)."
            exit 1
        fi
        ;;

    Darwin)
        if [[ "${ARCH}" == "arm64" ]]; then
            PKG="AstroBox_${VERSION}_arm64.dmg"
        else
            PKG="AstroBox_${VERSION}_x86_64.dmg"
        fi
        ;;

    *)
        echo "Unsupported OS: ${OS}"
        exit 1
        ;;
esac

URL="${RELEASE_URL}/${PKG}"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "${TMP_DIR}"' EXIT

printf '%b\n' '      \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m███████\033[0m  \033[38;2;23;129;255m████████\033[0m \033[38;2;23;129;255m███████\033[0m     \033[38;2;23;129;255m██████\033[0m   \033[38;2;23;129;255m███████\033[0m    \033[38;2;23;129;255m██████\033[0m   \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m'
printf '%b\n' '     \033[38;2;23;129;255m████\033[0m  \033[38;2;23;129;255m██\033[0m           \033[38;2;23;129;255m██\033[0m           \033[38;2;23;129;255m██\033[0m  \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m  \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m  \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m   \033[38;2;23;129;255m██\033[0m  \033[38;2;23;129;255m██\033[0m'
printf '%b\n' '   \033[38;2;23;129;255m██\033[0m  \033[38;2;23;129;255m██\033[0m   \033[38;2;23;129;255m███████\033[0m     \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m \033[38;2;23;129;255m█████\033[0m  \033[38;2;23;129;255m██\033[0m      \033[38;2;23;129;255m██\033[0m \033[38;2;23;129;255m███████\033[0m  \033[38;2;23;129;255m██\033[0m      \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m'
printf '%b\n' '  \033[38;2;23;129;255m██\033[0m \033[38;2;23;129;255m█████\033[0m        \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m   \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m  \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m  \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m   \033[38;2;23;129;255m██\033[0m  \033[38;2;23;129;255m██\033[0m'
printf '%b\n' '\033[38;2;23;129;255m███\033[0m     \033[38;2;23;129;255m██\033[0m  \033[38;2;23;129;255m███████\033[0m     \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m███\033[0m   \033[38;2;23;129;255m██████\033[0m   \033[38;2;23;129;255m███████\033[0m    \033[38;2;23;129;255m██████\033[0m   \033[38;2;23;129;255m██\033[0m    \033[38;2;23;129;255m██\033[0m'

echo "Detected: ${OS} ${ARCH}"
read -rp "Ready to install AstroBox NG ${VERSION} on ${OS} ${ARCH}? [Y/n] " CONFIRM
if [[ -n "${CONFIRM}" && "${CONFIRM}" != [yY] ]]; then
    echo "Installation cancelled."
    exit 0
fi

echo "Downloading ${PKG}..."

if command -v curl &>/dev/null; then
    curl -fsSL --progress-bar -o "${TMP_DIR}/${PKG}" "${URL}"
elif command -v wget &>/dev/null; then
    wget --show-progress -q -O "${TMP_DIR}/${PKG}" "${URL}"
else
    echo "Please install curl or wget."
    exit 1
fi

echo "Installing AstroBox NG ${VERSION}..."

if [[ "${OS}" == "Darwin" ]]; then
    # Mount DMG and copy .app to /Applications
    MOUNT_POINT=$(hdiutil attach "${TMP_DIR}/${PKG}" -nobrowse -noautoopen | awk 'END {print $NF}')
    trap 'hdiutil detach "${MOUNT_POINT}" >/dev/null 2>&1 || true; rm -rf "${TMP_DIR}"' EXIT

    APP_NAME=$(find "${MOUNT_POINT}" -maxdepth 1 -name "*.app" -print -quit)
    if [[ -z "${APP_NAME}" ]]; then
        echo "Could not find AstroBox.app in the DMG."
        exit 1
    fi

    APP_BASENAME=$(basename "${APP_NAME}")
    if [[ -d "/Applications/${APP_BASENAME}" ]]; then
        echo "Replacing existing /Applications/${APP_BASENAME}..."
        rm -rf "/Applications/${APP_BASENAME}"
    fi

    cp -R "${APP_NAME}" /Applications/
    hdiutil detach "${MOUNT_POINT}" >/dev/null
    echo "Installed /Applications/${APP_BASENAME}"

    # Bypass Gatekeeper quarantine check for not-notarized apps
    echo "Removing quarantine attribute..."
    sudo xattr -rd com.apple.quarantine "/Applications/${APP_BASENAME}"
else
    "${INSTALLER[@]}" "${TMP_DIR}/${PKG}"
    if [[ ${#POST_INSTALL[@]} -gt 0 ]]; then
        "${POST_INSTALL[@]}" || true
    fi
fi

echo "AstroBox NG ${VERSION} installed successfully!"
