"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeClientProps {
  text?: string;
  caption?: string;
}

export default function QRCodeClient({ text, caption }: QRCodeClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const value = text ?? (typeof window !== "undefined" ? window.location.toString() : "");

  return (
    <figure
      style={{
        textAlign: "center",
        margin: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-start",
      }}
    >
      <div
        style={{
          minHeight: "128px",
          position: "relative",
          marginTop: "-15px",
        }}
      >
        {mounted && value && (
          <QRCodeSVG
            value={value}
            style={{
              objectFit: "contain",
              padding: "10px",
              borderRadius: "12px",
              background: "var(--qr-background-color, white)",
              border: "1px solid var(--qr-border-color, #00000065)",
            }}
            bgColor="transparent"
          />
        )}
      </div>
      {caption && (
        <figcaption
          style={{
            margin: "8px 14px",
            fontSize: "clamp(0.813rem, 0.722rem + 0.45vw, 0.875rem)",
            color: "var(--color-text)",
            opacity: 0.4,
            whiteSpace: "pre-line",
            textAlign: "left",
            lineHeight: "20px",
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
