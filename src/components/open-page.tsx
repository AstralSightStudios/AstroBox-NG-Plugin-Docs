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
      <div data-debug={isDebugPage ? "true" : undefined} data-open-page="">
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
      </div>
      <style jsx global>{`
        [data-open-page] {
          --color-primary: var(--color-fd-primary);
          --color-primary-markdown: color-mix(
            in srgb,
            var(--color-brand) 80%,
            var(--color-text)
          );
          --color-brand: var(--color-fd-primary);
          --color-secondary: var(--color-fd-primary);
          --color-tertiary: color-mix(
            in srgb,
            var(--color-fd-primary) 24%,
            var(--color-fd-background)
          );
          --color-green: #203c25;
          --color-yellow: #664019;
          --color-danger: #641723;
          --color-text: var(--color-fd-foreground);
          --color-main-background: var(--color-fd-background);
          --color-gray-background: var(--color-fd-muted);
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
          --font-family: var(--font-sans);
          --font-family-flex: var(--font-family);
          --font-family-serif: var(--font-family);
          --font-family-mono: var(--font-mono);
          -webkit-tap-highlight-color: transparent;
          font-feature-settings: "liga" 1, "calt" 1, "ss07" 1, "ss08" 1,
            "cv01" 1, "cv03" 1, "cv04" 1, "cv10" 1;
          --qr-background-color: transparent;
          --qr-border-color: color-mix(
            in srgb,
            var(--color-fd-foreground) 35%,
            transparent
          );
        }

        .dark [data-open-page] {
          --qr-background-color: white;
          --qr-border-color: transparent;
        }

        @supports (corner-shape: superellipse(2)) {
          [data-open-page] {
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

        [data-open-page] {
          color: var(--color-text);
          background-color: var(--color-main-background);
        }

        [data-open-page] * {
          font-family: var(--font-family);
        }

        [data-open-page] *::selection {
          background-color: transparent;
          color: var(--color-brand);
        }

        [data-open-page] {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 48px;
          width: min(90vw, 996px);
          margin: 0 auto;
          flex: 1;
        }

        [data-open-page] h1 {
          color: var(--color-text);
          font-family: var(--font-family);
          font-size: 2.25rem;
          font-weight: 600;
          margin: 0;
          line-height: 1.25;
          letter-spacing: -0.025em;
          word-break: keep-all;
        }

        [data-open-page] h2 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        [data-open-page] p {
          margin: 0;
        }

        [data-open-page] a {
          color: var(--color-text);
        }

        [data-open-page] .titleContainer {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          padding: 4px;
        }

        [data-open-page] .hint {
          opacity: 0.6;
          font-size: 14px;
        }

        [data-open-page] .links {
          display: flex;
          gap: 32px;
        }

        [data-open-page] .btnContainer {
          display: flex;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
          margin: 12px -4px;
        }

        [data-open-page] .btnContainer > * {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 20px;
          border-radius: var(--radius-5xl);
          background: color-mix(in srgb, var(--color-text) 10%, transparent);
          color: var(--color-text);
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          border: solid 1px
            color-mix(in srgb, var(--color-text) 0%, transparent);
          cursor: pointer;
          transition: all 0.3s ease-in-out;
        }

        [data-open-page] .btnContainer > *:hover {
          background: color-mix(in srgb, var(--color-text) 12%, transparent);
          border: solid 1px
            color-mix(in srgb, var(--color-text) 10%, transparent);
          box-shadow: 0 1px 8px 0 rgb(0 0 0 / 10%);
          opacity: 1;
        }

        [data-open-page] .btnContainer > *:active {
          background: color-mix(in srgb, var(--color-text) 8%, transparent);
          border: solid 1px
            color-mix(in srgb, var(--color-text) 8%, transparent);
          box-shadow: 0 0.5px 4px 0 rgb(0 0 0 / 10%);
          opacity: 1;
        }

        [data-open-page] .btnContainer > *:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        [data-open-page] .debugPanel {
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

        [data-open-page][data-debug="true"] .debugPanel {
          display: flex;
        }

        [data-open-page] dl {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 0;
        }

        [data-open-page] dl div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        [data-open-page] dt {
          font-size: 13px;
          opacity: 0.6;
        }

        [data-open-page] dd {
          margin: 0;
          line-height: 1.5;
          word-break: break-all;
        }

        @media (min-width: 640px) {
          [data-open-page] h1 {
            font-size: 3rem;
          }
        }

        @media (min-width: 768px) {
          [data-open-page] h1 {
            font-size: 3.75rem;
          }
        }

        .dark [data-open-page] .btnContainer > *:hover {
          box-shadow: 0 4px 12px 0 rgb(0 0 0 / 30%);
        }

        .dark [data-open-page] .btnContainer > *:active {
          box-shadow: 0 2px 6px 0 rgb(0 0 0 / 30%);
        }

        @media (max-width: 568px) {
          [data-open-page] .links {
            flex-direction: column;
            gap: 8px;
          }

          [data-open-page] {
            padding: 96px 0 0;
          }
        }
      `}</style>
    </>
  );
}
