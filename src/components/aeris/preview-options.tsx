import { ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatch, Input, Label, ListBox, NumberField, Select } from "@heroui/react";
import { useId, useState } from "react";

const options: Record<string, { label: string; min: number; max: number; initial: number; select?: boolean; color?: string }> = {
  "confirmation-overlay": { label: "最后一段停留（秒，0 为关闭）", min: 0, max: 60, initial: 4 },
  "rolling-time": { label: "字号（px）", min: 16, max: 72, initial: 48 },
  "progress-ring": { label: "每次步进", min: 1, max: 256, initial: 64, color: "#ff8400" },
  "progress-bar": { label: "每次步进", min: 1, max: 256, initial: 64, color: "#0088ff" },
  "stepped-slider": { label: "轨道段数", min: 1, max: 10, initial: 3, select: true },
  "numeric-wheel": { label: "滚轮数量", min: 1, max: 3, initial: 2, select: true },
};

const tapActions = [
  { label: "查看详情", value: "1" },
  { label: "关闭浮层", value: "0" },
];

const fieldClass = "min-w-0 max-w-xs flex-[1_1_12rem] max-md:w-full max-md:max-w-none max-md:basis-full";
const controlsClass = "flex flex-wrap items-end gap-4";

export function hasPreviewOptions(component: string) {
  return Object.hasOwn(options, component);
}

function NumericField({ label, value, onChange, min, max }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  return (
    <NumberField className={fieldClass} value={value} onChange={(nextValue) => {
      if (Number.isInteger(nextValue) && nextValue >= min && nextValue <= max) onChange(nextValue);
    }} minValue={min} maxValue={max}
      step={1} isRequired formatOptions={{ useGrouping: false }}>
      <Label>{label}</Label>
      <NumberField.Group>
        <NumberField.DecrementButton aria-label="减少数值" />
        <NumberField.Input />
        <NumberField.IncrementButton aria-label="增加数值" />
      </NumberField.Group>
    </NumberField>
  );
}

function SelectField({ label, value, onChange, items }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: typeof tapActions;
}) {
  return (
    <Select className={fieldClass} value={value} onChange={(key) => {
      if (typeof key === "string") onChange(key);
    }}>
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="aeris-preview-popover dark" data-theme="dark">
        <ListBox>
          {items.map((item) => (
            <ListBox.Item key={item.value} id={item.value} textValue={item.label}>
              {item.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

export function PreviewOptions({ component, onChange }: {
  component: string;
  onChange: (value: number, color?: string, firstStage?: number, firstTap?: string) => void;
}) {
  const option = options[component];
  const [draft, setDraft] = useState(() => option?.initial ?? 0);
  const [color, setColor] = useState<string>();
  const [colorPortal, setColorPortal] = useState<HTMLDivElement | null>(null);
  const [firstStage, setFirstStage] = useState(550);
  const [firstTap, setFirstTap] = useState("1");
  const colorLabelId = useId();
  const currentColor = color ?? option?.color;
  const confirmation = component === "confirmation-overlay";
  if (!option) return null;

  const items = option.select ? Array.from({ length: option.max - option.min + 1 }, (_, index) => {
      const value = String(option.min + index);
      return { label: value, value };
    }) : [];

  return (
    <div className="space-y-3 border-t border-fd-border p-4">
      <div className={controlsClass}>
        {option.select ? (
          <SelectField label={option.label} items={items} value={String(draft)} onChange={(value) => {
            setDraft(Number(value));
            onChange(Number(value));
          }} />
        ) : (
          <NumericField label={option.label} min={option.min} max={option.max} value={draft} onChange={(value) => {
            setDraft(value);
            onChange(value, color, confirmation ? firstStage : undefined, confirmation ? firstTap : undefined);
          }} />
        )}
        {confirmation && (
          <>
            <NumericField label="一级停留（毫秒）" min={0} max={60000} value={firstStage} onChange={(value) => {
              setFirstStage(value);
              onChange(draft, color, value, firstTap);
            }} />
            <SelectField label="带正文时点按一级" items={tapActions} value={firstTap} onChange={(value) => {
              setFirstTap(value);
              onChange(draft, color, firstStage, value);
            }} />
          </>
        )}
        {currentColor !== undefined && (
          <div className={`flex flex-col gap-1 ${fieldClass}`}>
            <Label id={colorLabelId}>进度颜色</Label>
            <ColorPicker value={currentColor} onChange={(value) => {
              const hex = value.toString("hex");
              setColor(hex);
              onChange(draft, hex);
            }}>
              <ColorPicker.Trigger aria-labelledby={`${colorLabelId} ${colorLabelId}-value`}
                className="w-full bg-transparent! px-1.5">
                <span className="aeris-color-wheel" aria-hidden="true">
                  <ColorSwatch size="xs" className="rounded-full" />
                </span>
                <span id={`${colorLabelId}-value`} className="font-mono text-sm">{currentColor.toUpperCase()}</span>
              </ColorPicker.Trigger>
              <ColorPicker.Popover aria-labelledby={colorLabelId} placement="top" offset={8}
                UNSTABLE_portalContainer={colorPortal ?? undefined} className="aeris-preview-popover dark" data-theme="dark">
                <ColorArea aria-label="饱和度和亮度" colorSpace="hsb" xChannel="saturation" yChannel="brightness">
                  <ColorArea.Thumb />
                </ColorArea>
                <ColorSlider aria-label="色相" channel="hue" colorSpace="hsb">
                  <ColorSlider.Track>
                    <ColorSlider.Thumb />
                  </ColorSlider.Track>
                </ColorSlider>
                <ColorField>
                  <Label>十六进制颜色</Label>
                  <Input />
                </ColorField>
              </ColorPicker.Popover>
            </ColorPicker>
            <div ref={setColorPortal} className="pointer-events-none fixed inset-0 z-40" />
          </div>
        )}
      </div>
      <p className="text-sm text-fd-muted-foreground">更改配置将自动应用并重载</p>
    </div>
  );
}
