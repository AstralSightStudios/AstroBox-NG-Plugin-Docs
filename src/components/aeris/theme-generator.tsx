"use client";

import { useState } from "react";
import { AerisPreview } from "./preview";

const fields = [
  { id: "background", label: "页面背景", color: "#000000", description: "页面底色" },
  { id: "primary", label: "主文字", color: "#FFFFFF", description: "卡片标题、选项文字、弹窗正文" },
  { id: "secondary", label: "次文字", color: "#AAAAAA", description: "卡片副标题、弹窗取消按钮" },
  { id: "accent", label: "强调色", color: "#0088FF", description: "标题栏标题、选项副标题、弹窗标题和主按钮" },
];

const defaults = fields.map(({ color }) => color);

export function AerisThemeGenerator() {
  const [colors, setColors] = useState(defaults);
  const [applied, setApplied] = useState(defaults);
  const palette = applied.map((color, index) => fields[index].id !== "accent" && color === defaults[index] ? "" : color).join(",");

  function restore() {
    setColors(defaults);
    setApplied(defaults);
  }

  return (
    <>
      <form
        className="not-prose space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setApplied(colors);
        }}
      >
        {fields.map(({ id, label, description }, index) => (
          <div key={id} className="flex items-center gap-3">
            <input
              id={`aeris-color-${id}`}
              type="color"
              value={colors[index]}
              aria-describedby={`aeris-color-description-${id}`}
              onChange={(event) => {
                const color = event.currentTarget.value.toUpperCase();
                setColors((current) => current.map((value, position) => position === index ? color : value));
              }}
            />
            <div>
              <label htmlFor={`aeris-color-${id}`}>{label}</label>
              <span className="ms-2 font-mono text-sm text-fd-muted-foreground">{colors[index]}</span>
              <div id={`aeris-color-description-${id}`} className="text-sm text-fd-muted-foreground">
                {description}
              </div>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="rounded-md bg-fd-primary px-3 py-2 text-sm text-fd-primary-foreground">
            应用配色
          </button>
          <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={restore}>
            恢复默认
          </button>
        </div>
      </form>
      <h2>设备预览</h2>
      <AerisPreview component="theme" title="Aeris 主题预览" palette={palette} />
    </>
  );
}
