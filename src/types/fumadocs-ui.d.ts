declare module 'fumadocs-ui/utils/cn' {
  export function cn(...inputs: any[]): string;
}

declare module 'fumadocs-ui/utils/merge-refs' {
  export function mergeRefs<T>(...refs: any[]): (value: T | null) => void;
}

declare module 'fumadocs-ui/layouts/shared/language-toggle' {
  import { ComponentProps } from 'react';
  export function LanguageToggle(props: ComponentProps<'button'>): React.ReactElement;
  export function LanguageToggleText(props: ComponentProps<'span'>): React.ReactElement;
}

declare module 'fumadocs-ui/layouts/shared/theme-toggle' {
  import { ComponentProps } from 'react';
  export function ThemeToggle(props: ComponentProps<'div'> & { mode?: 'light-dark' | 'light-dark-system' }): React.ReactElement;
}
