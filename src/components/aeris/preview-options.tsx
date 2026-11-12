import { useState } from 'react';

const options: Record<string, { label: string; min: number; max: number; initial: number; select?: boolean; color?: string }> = {
  'rolling-time': { label: '字号（px）', min: 16, max: 72, initial: 48 },
  'progress-ring': { label: '每次步进', min: 1, max: 256, initial: 64, color: '#ff8400' },
  'progress-bar': { label: '每次步进', min: 1, max: 256, initial: 64, color: '#0088ff' },
  'stepped-slider': { label: '轨道段数', min: 1, max: 10, initial: 3, select: true },
  'numeric-wheel': { label: '滚轮数量', min: 1, max: 3, initial: 2, select: true },
};

const fieldClass = 'min-w-20 rounded-md border border-current/20 bg-transparent px-2 py-1 text-inherit';

export function PreviewOptions({ component, onChange }: {
  component: string;
  onChange: (value: number, color?: string) => void;
}) {
  const option = options[component];
  const [draft, setDraft] = useState(() => String(option?.initial ?? ''));
  const [color, setColor] = useState<string>();
  if (!option) return null;

  if (option.select) {
    return (
      <label className="flex w-fit items-center gap-2 text-sm">
        <span>{option.label}</span>
        <select className={fieldClass} value={draft} onChange={(event) => {
          setDraft(event.currentTarget.value);
          onChange(Number(event.currentTarget.value));
        }}>
          {Array.from({ length: option.max - option.min + 1 }, (_, index) => index + option.min)
            .map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
    );
  }

  return (
    <form className="flex flex-wrap items-center gap-2 text-sm" onSubmit={(event) => {
      event.preventDefault();
      onChange(Number(draft), color);
    }}>
      <label className="flex items-center gap-2">
        <span>{option.label}</span>
        <input className={fieldClass} type="number" min={option.min} max={option.max} step={1}
          required value={draft} onChange={(event) => setDraft(event.currentTarget.value)} />
      </label>
      {option.color !== undefined && (
        <label className="flex items-center gap-2">
          <span>进度颜色</span>
          <input type="color" value={color ?? option.color} onChange={(event) => setColor(event.currentTarget.value)} />
        </label>
      )}
      <button type="submit" className={fieldClass + ' cursor-pointer'}>应用</button>
    </form>
  );
}
