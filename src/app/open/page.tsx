import type { Metadata, Viewport } from "next";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import OpenPage from "@/components/open-page";
import { baseOptions } from "@/lib/layout.shared";
import { openCopy } from "@/lib/open-copy";

interface OpenPageSearchParams {
  debug?: string;
}

const title = "正在打开客户端";
const pageTitle = `AstroBox / ${title}`;

function getInlineScript(isDebugPage: boolean) {
  if (isDebugPage) {
    return getDebugScript();
  }

  return `
    const updateDebugItem = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    };

    const setOpenAction = (id, handler) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('click', (event) => {
          event.preventDefault();
          handler();
        });
      }
    };

    ${getAutoScript()}
  `;
}

function getDebugScript() {
  return `
    ;(() => {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('debug');

      const linkQuery = currentUrl.searchParams.toString();
      const query = linkQuery ? '?' + linkQuery : '';
      const serverLinkUrl = 'http://127.0.0.1:10721/open' + query;
      const schemeUrl = 'astrobox://open' + query;

      const ua = navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android/.test(ua);
      const isIOS = /iphone|ipad|ipod/.test(ua);

      updateDebugItem('debug-enabled', ${JSON.stringify(openCopy.enabled)});
      updateDebugItem('debug-user-agent', navigator.userAgent);
      updateDebugItem('debug-environment', isMobile ? ${JSON.stringify(openCopy.mobile)} : ${JSON.stringify(openCopy.desktop)});
      updateDebugItem('debug-strategy', isIOS ? ${JSON.stringify(openCopy.schemeWithFallback)} : ${JSON.stringify(openCopy.scheme)});
      updateDebugItem('debug-final-link', schemeUrl);
      updateDebugItem('debug-scheme-link', schemeUrl);
      updateDebugItem('debug-server-link', serverLinkUrl);
      updateDebugItem('debug-auto-redirect', ${JSON.stringify(openCopy.enabledValue)});
    })();
  `;
}

function getAutoScript() {
  return `
    ;(async function () {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('debug');

      const linkQuery = currentUrl.searchParams.toString();
      const query = linkQuery ? '?' + linkQuery : '';
      const serverLinkUrl = 'http://127.0.0.1:10721/open' + query;
      const schemeUrl = 'astrobox://open' + query;

      const ua = navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android/.test(ua);
      const isIOS = /iphone|ipad|ipod/.test(ua);

      let useServerLink = false;

      if (!isMobile) {
        try {
          const res = await fetch(serverLinkUrl, {
            method: 'GET',
            mode: 'no-cors',
          });

          if (res) {
            useServerLink = true;
          }
        } catch (_error) {
          useServerLink = false;
        }
      }

      const finalLink = isMobile
        ? schemeUrl
        : useServerLink
          ? serverLinkUrl
          : schemeUrl;

      setOpenAction('open', () => {
        window.location.href = finalLink;
      });
      setOpenAction('open-scheme', () => {
        window.location.href = schemeUrl;
      });
      setOpenAction('open-server', () => {
        window.location.href = serverLinkUrl;
      });

      updateDebugItem('debug-auto-redirect', ${JSON.stringify(openCopy.disabledValue)});

      if (isMobile) {
        window.location.href = finalLink;

        if (isIOS) {
          setTimeout(() => {
            window.location.href = serverLinkUrl;
          }, 1200);
        }
        return;
      }

      setTimeout(() => {
        window.location.href = finalLink;
      }, 1000);
    })();
  `;
}

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },
  other: {
    title,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1972F8" },
    { media: "(prefers-color-scheme: dark)", color: "#1C4D98" },
  ],
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<OpenPageSearchParams>;
}) {
  const params = await searchParams;
  const debugParam = params.debug?.toLowerCase() ?? null;
  const isDebugPage =
    debugParam !== null && ["1", "true", "yes", "on"].includes(debugParam);

  return (
    <HomeLayout {...baseOptions()} className="bg-[#101010]">
      <OpenPage
        isDebugPage={isDebugPage}
        homePath="/"
        downloadPath="/downloads/"
      />
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{ __html: getInlineScript(isDebugPage) }}
      />
    </HomeLayout>
  );
}
