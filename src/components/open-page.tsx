"use client";

import {
  ArrowsClockwiseIcon,
  GlobeSimpleIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";
import { openCopy as copy } from "@/lib/open-copy";
import QRCodeClient from "@/components/qr-code-client";

interface OpenPageProps {
  isDebugPage: boolean;
  homePath: string;
  downloadPath: string;
}

export default function OpenPage({
  isDebugPage,
  homePath,
  downloadPath,
}: OpenPageProps) {
  return (
    <>
      <main data-debug={isDebugPage ? "true" : undefined}>
        <div className="titleContainer">
          <h1>{copy.heading}</h1>
          <p className="hint">{copy.prompt}</p>
        </div>
        <div className="links">
          <div className="titleContainer">
            <p className="hint">{copy.autoOpenFailed}</p>
            <div className="btnContainer">
              <button id="open" type="button" disabled={isDebugPage}>
                <ArrowsClockwiseIcon size={18} weight="bold" />
                {copy.retry}
              </button>
              <a href={homePath}>
                <GlobeSimpleIcon size={18} weight="bold" />
                {copy.openWeb}
              </a>
            </div>
          </div>
          <div className="titleContainer">
            <p className="hint">{copy.notInstalled}</p>
            <div className="btnContainer">
              <a href={downloadPath}>
                <DownloadSimpleIcon size={18} weight="bold" />
                {copy.goDownload}
              </a>
            </div>
          </div>
          <section className="debugPanel" aria-live="polite">
            <h2>{copy.debugTitle}</h2>
            <p className="hint" id="debug-enabled"></p>
            <dl>
              <div>
                <dt>{copy.debugUserAgent}</dt>
                <dd id="debug-user-agent"></dd>
              </div>
              <div>
                <dt>{copy.debugEnvironment}</dt>
                <dd id="debug-environment"></dd>
              </div>
              <div>
                <dt>{copy.debugStrategy}</dt>
                <dd id="debug-strategy"></dd>
              </div>
              <div>
                <dt>{copy.debugFinalLink}</dt>
                <dd id="debug-final-link"></dd>
              </div>
              <div>
                <dt>{copy.debugSchemeLink}</dt>
                <dd id="debug-scheme-link"></dd>
              </div>
              <div>
                <dt>{copy.debugServerLink}</dt>
                <dd id="debug-server-link"></dd>
              </div>
              <div>
                <dt>{copy.debugAutoRedirect}</dt>
                <dd id="debug-auto-redirect"></dd>
              </div>
            </dl>
            <div className="btnContainer">
              <button id="open-scheme" type="button" disabled={isDebugPage}>
                <ArrowsClockwiseIcon size={18} weight="bold" />
                {copy.retryWithScheme}
              </button>
              <button id="open-server" type="button" disabled={isDebugPage}>
                <ArrowsClockwiseIcon size={18} weight="bold" />
                {copy.retryWithServer}
              </button>
            </div>
          </section>
        </div>
        <QRCodeClient caption={copy.qrCaption} />
      </main>
      <style jsx global>{`
        @font-face {
          font-family: "Geist";
          src: url("https://astrobox-statics.waterflames.cn/Geist-VariableFont.ttf");
          font-display: swap;
        }

        @font-face {
          font-family: "Sarasa Mono SC";
          src: url("https://astrobox-statics.waterflames.cn//SarasaMonoSC-Regular.woff2")
            format("woff2");
          font-weight: 100 500;
        }

        @font-face {
          font-family: "Sarasa Mono SC";
          src: url("https://astrobox-statics.waterflames.cn//SarasaMonoSC-SemiBold.woff2")
            format("woff2");
          font-weight: 600 900;
        }

        :root {
          font-family: var(--font-family);
        }

        html {
          margin: 0;
          width: 100%;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: color-mix(in srgb, var(--color-text) 28%, transparent)
            transparent;
          background-color: var(--color-main-background);
        }

        body {
          margin: 0;
          width: 100%;
          overflow-x: clip;
          scrollbar-width: thin;
          scrollbar-color: color-mix(in srgb, var(--color-text) 28%, transparent)
            transparent;
          background-color: var(--color-main-background);
        }

        html {
          height: 100%;
        }

        body {
          min-height: 100%;
        }

        :root {
          --color-primary: #b3d5ff;
          --color-primary-markdown: color-mix(
            in srgb,
            var(--color-brand) 80%,
            var(--color-text)
          );
          --color-brand: #1781ff;
          --color-secondary: var(--color-brand);
          --color-tertiary: #0b407f;
          --color-green: #203c25;
          --color-yellow: #664019;
          --color-danger: #641723;
          background-color: var(--color-main-background);
          color: var(--color-text);
          font-family: var(--font-family);
          overflow-x: hidden;
          --color-text: #000;
          --color-main-background: #ffffff;
          --color-gray-background: #f5f5f8;
          --radius-root-base: 64px;
          --radius-5xl-base: 64px;
          --radius-4xl-base: 56px;
          --radius-3xl-base: 48px;
          --radius-2xl-base: 32px;
          --radius-xl-base: 24px;
          --radius-lg-base: 20px;
          --radius-md-base: 16px;
          --radius-sm-base: 12px;
          --radius-xs-base: 8px;
          --radius-2xs-base: 4px;
          --radius-root: calc(var(--radius-root-base) / 2);
          --radius-5xl: calc(var(--radius-5xl-base) / 2);
          --radius-4xl: calc(var(--radius-4xl-base) / 2);
          --radius-3xl: calc(var(--radius-3xl-base) / 2);
          --radius-2xl: calc(var(--radius-2xl-base) / 2);
          --radius-xl: calc(var(--radius-xl-base) / 2);
          --radius-lg: calc(var(--radius-lg-base) / 2);
          --radius-md: calc(var(--radius-md-base) / 2);
          --radius-sm: calc(var(--radius-sm-base) / 2);
          --radius-xs: calc(var(--radius-xs-base) / 2);
          --radius-2xs: calc(var(--radius-2xs-base) / 2);
          --font-family: "Geist", "MiSans", "MiSans Chinese", MiSans, system-ui,
            miui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          --font-family-flex: var(--font-family);
          --font-family-serif: "Clara Serif Pro Med", serif;
          --font-family-mono: "Sarasa Mono SC", "Courier New", Courier, "Geist",
            "MiSans", "MiSans Chinese", MiSans, system-ui, miui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
            "Open Sans", "Helvetica Neue", monospace, sans-serif;
          -webkit-tap-highlight-color: transparent;
          font-feature-settings: "liga" 1, "calt" 1, "ss07" 1, "ss08" 1,
            "cv01" 1, "cv03" 1, "cv04" 1, "cv10" 1;
          --qr-background-color: transparent;
          --qr-border-color: #00000065;
        }

        @supports (corner-shape: superellipse(2)) {
          * {
            corner-shape: superellipse(2);
          }

          :root {
            --radius-root: var(--radius-root-base);
            --radius-5xl: var(--radius-5xl-base);
            --radius-4xl: var(--radius-4xl-base);
            --radius-3xl: var(--radius-3xl-base);
            --radius-2xl: var(--radius-2xl-base);
            --radius-xl: var(--radius-xl-base);
            --radius-lg: var(--radius-lg-base);
            --radius-md: var(--radius-md-base);
            --radius-sm: var(--radius-sm-base);
            --radius-xs: var(--radius-xs-base);
            --radius-2xs: var(--radius-2xs-base);
          }
        }

        :root {
          --color-primary: #0b407f;
          --color-tertiary: #b3d5ff;
          --color-green: #65ba74;
          --color-yellow: #e9c162;
          --color-danger: #eb8e90;
          background-color: var(--color-main-background);
          color: var(--color-text);
          --color-text: #fff;
          --color-main-background: #101010 !important;
          --color-gray-background: #1b1b1d !important;
          --qr-background-color: white;
          --qr-border-color: transparent;
        }

        * {
          font-family: var(--font-family);
        }

        *::selection {
          background-color: transparent;
          color: var(--color-brand);
        }

        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        ::-webkit-scrollbar-track,
        ::-webkit-scrollbar-track-piece,
        ::-webkit-scrollbar-corner {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--color-text) 22%, transparent);
          border-radius: 999px;
          border: 3px solid transparent;
          background-clip: content-box;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: color-mix(in srgb, var(--color-text) 34%, transparent);
          background-clip: content-box;
        }

        ::-webkit-scrollbar-thumb:active {
          background: color-mix(in srgb, var(--color-text) 48%, transparent);
          background-clip: content-box;
        }

        body {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          overflow: hidden;
          padding: 0;
          width: 100vw;
          background-color: transparent;
        }

        main {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 48px;
          width: min(90vw, 996px);
          margin: 0 auto;
        }

        h1 {
          background-image: linear-gradient(
            to top,
            var(--color-text),
            color-mix(in srgb, var(--color-text) 50%, transparent)
          );
          -webkit-background-clip: text;
          color: transparent;
          font-family: var(--font-family-serif);
          font-size: clamp(2.75rem, 2.386rem + 1.82vw, 3rem);
          font-weight: 400;
          margin: 0;
          line-height: calc(
            clamp(2.875rem, 0.722rem + 0.45vw, 3.125rem) * 1.4
          );
          letter-spacing: -2px;
        }

        h2 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        p {
          margin: 0;
        }

        a {
          color: var(--color-text);
        }

        .titleContainer {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          padding: 4px;
        }

        .hint {
          opacity: 0.6;
          font-size: 14px;
        }

        .links {
          display: flex;
          gap: 32px;
        }

        .btnContainer {
          display: flex;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
          margin: 12px -4px;
        }

        .btnContainer > * {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 20px;
          border-radius: var(--radius-5xl);
          background: color-mix(in srgb, var(--color-text) 10%, transparent);
          color: var(--color-text);
          font-family: "MiSans VF", "MiSans", var(--font-family) !important;
          font-size: 15px;
          font-weight: 520;
          text-decoration: none;
          border: solid 1px
            color-mix(in srgb, var(--color-text) 0%, transparent);
          cursor: pointer;
          transition: all 0.3s ease-in-out;
        }

        .btnContainer > *:hover {
          background: color-mix(in srgb, var(--color-text) 12%, transparent);
          border: solid 1px
            color-mix(in srgb, var(--color-text) 10%, transparent);
          box-shadow: 0 1px 8px 0 rgb(0 0 0 / 10%);
          opacity: 1;
        }

        .btnContainer > *:active {
          background: color-mix(in srgb, var(--color-text) 8%, transparent);
          border: solid 1px
            color-mix(in srgb, var(--color-text) 8%, transparent);
          box-shadow: 0 0.5px 4px 0 rgb(0 0 0 / 10%);
          opacity: 1;
        }

        .btnContainer > *:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .debugPanel {
          display: none;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
          margin: 4px;
          border: solid 1px
            color-mix(in srgb, var(--color-text) 8%, transparent);
          border-radius: var(--radius-3xl);
          background: color-mix(in srgb, var(--color-text) 6%, transparent);
        }

        main[data-debug="true"] .debugPanel {
          display: flex;
        }

        dl {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 0;
        }

        dl div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        dt {
          font-size: 13px;
          opacity: 0.6;
        }

        dd {
          margin: 0;
          line-height: 1.5;
          word-break: break-all;
        }

        @media (prefers-color-scheme: dark) {
          .btnContainer > *:hover {
            box-shadow: 0 4px 12px 0 rgb(0 0 0 / 30%);
          }

          .btnContainer > *:active {
            box-shadow: 0 2px 6px 0 rgb(0 0 0 / 30%);
          }
        }

        @media (max-width: 568px) {
          body {
            overflow: auto;
          }

          .links {
            flex-direction: column;
            gap: 8px;
          }

          main {
            padding: 96px 0 0;
          }
        }
      `}</style>
    </>
  );
}
