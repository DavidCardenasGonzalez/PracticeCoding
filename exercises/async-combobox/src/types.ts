import type { ReactNode } from 'react';

export interface LoadOptionsContext {
  readonly signal: AbortSignal;
}

export type LoadOptions<T> = (
  query: string,
  context: LoadOptionsContext,
) => Promise<ReadonlyArray<T>>;

export interface AsyncComboboxProps<T> {
  readonly id?: string;
  readonly label: string;
  readonly loadOptions: LoadOptions<T>;
  readonly getOptionKey: (option: T) => string;
  readonly getOptionLabel: (option: T) => string;
  readonly value: T | null;
  readonly onChange: (value: T | null) => void;
  readonly debounceMs?: number;
  readonly minQueryLength?: number;
  readonly cacheTimeMs?: number;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly loadingText?: ReactNode;
  readonly noOptionsText?: ReactNode;
  readonly errorText?: (error: unknown) => ReactNode;
}
