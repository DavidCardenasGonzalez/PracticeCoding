import { useId, useState } from 'react';

import type { AsyncComboboxProps } from './types.js';

/**
 * Starter shell for the exercise.
 *
 * The markup intentionally implements only the static, controlled input contract.
 * Complete the async state machine and interaction behavior described in README.md.
 */
export function AsyncCombobox<T>({
  id,
  label,
  getOptionLabel,
  value,
  disabled = false,
  placeholder,
}: AsyncComboboxProps<T>) {
  const generatedId = useId();
  const inputId = id ?? `async-combobox-${generatedId}`;
  const listboxId = `${inputId}-listbox`;
  const [query, setQuery] = useState(() => (value === null ? '' : getOptionLabel(value)));

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        role="combobox"
        type="text"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded="false"
        onChange={(event) => {
          const nextQuery = event.currentTarget.value;
          setQuery(nextQuery);
        }}
      />
    </div>
  );
}
