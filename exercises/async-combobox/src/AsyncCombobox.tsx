import { useEffect, useId, useRef, useState } from 'react';

import type { AsyncComboboxProps } from './types.js';

/**
 * Starter shell for the exercise.
 *
 * The markup intentionally implements only the static, controlled input contract.
 * Complete the async state machine and interaction behavior described in README.md.
 */
function validateProps<T>(props: AsyncComboboxProps<T>): void {
  const values = [
    ['debounceMs', props.debounceMs ?? 250],
    ['minQueryLength', props.minQueryLength ?? 1],
    ['cacheTimeMs', props.cacheTimeMs ?? 30_000],
  ] as const;

  for (const [name, value] of values) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`${name} must be a finite non-negative number`);
    }
  }

  if (typeof props.loadOptions !== 'function') {
    throw new TypeError('loadOptions must be a function');
  }
}

export function AsyncCombobox<T>(props: AsyncComboboxProps<T>) {
  validateProps(props);
  const {
    id,
    label,
    getOptionKey,
    getOptionLabel,
    loadOptions,
    debounceMs = 250,
    minQueryLength = 1,
    cacheTimeMs = 30_000,
    value,
    onChange,
    disabled = false,
    placeholder,
    loadingText,
    errorText,
    noOptionsText,
  } = props;
  const generatedId = useId();
  const inputId = id ?? `async-combobox-${generatedId}`;
  const listboxId = `${inputId}-listbox`;
  const [query, setQuery] = useState(() => (value === null ? '' : getOptionLabel(value)));
  const [isComposing, setIsComposing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [options, setOptions] = useState<ReadonlyArray<T>>([]);
  const navigationIndex = useRef(-1);
  const cacheOption = useRef(new Map());
  const composedQuery = useRef(query);
  const requestSequence = useRef(0);

  useEffect(() => {
    if (disabled || isComposing || query.length < minQueryLength) {
      return;
    }
    setIsLoading(true);
    const cache = cacheOption.current.get(query);
    if (cacheTimeMs > 0 && cache && Date.now() - cache.createdAt < cacheTimeMs) {
      setOptions(cache.options);
      setIsLoading(false);
      return;
    }

    const requestNumber = ++requestSequence.current;
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => {
      void loadOptions(query, { signal: controller.signal })
        .then((nextOptions) => {
          if (active && requestNumber === requestSequence.current) {
            setOptions(nextOptions);
            cacheOption.current.set(query, {
              createdAt: Date.now(),
              options: nextOptions,
            });
          }
        })
        .catch((err) => {
          setError(err);
          // Error rendering is covered by later tests.
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, debounceMs);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    query,
    debounceMs,
    disabled,
    isComposing,
    loadOptions,
    minQueryLength,
    cacheTimeMs,
  ]);
  const handleKeydown = function (e: KeyboardEvent) {
    console.log(navigationIndex.current);
    console.log(e.key === 'ArrowDown');
    if (e.key === 'ArrowDown') {
      const newIndex = navigationIndex.current + 1;
      navigationIndex.current = newIndex;
      console.log(newIndex);
    } else if (e.key === 'ArrowUp') {
      const newIndex = navigationIndex.current - 1;
      navigationIndex.current = newIndex;
      console.log(newIndex);
    } else if (e.key === 'Enter' && options[navigationIndex.current]) {
      // navigationIndex.current;
      onChange(options[navigationIndex.current] as T)
      console.log(options);
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKeydown]);

  const hasOptions = options.length > 0;

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
        onCompositionStart={(event) => {
          composedQuery.current = event.currentTarget.value;
          setIsComposing(true);
        }}
        onCompositionEnd={(event) => {
          const finalQuery = composedQuery.current || event.currentTarget.value;
          setIsComposing(false);
          setQuery(finalQuery);
        }}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={hasOptions}
        // aria-activedescendant={activeOptionId}
        onChange={(event) => {
          const nextQuery = event.currentTarget.value;
          if (!isComposing) {
            setQuery(nextQuery);
            return;
          }
          composedQuery.current = nextQuery;
        }}
      />
      {hasOptions ? (
        <ul id={listboxId} role="listbox">
          {options.map((option, index) => {
            const key = getOptionKey(option);
            const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '-');
            return (
              <li
                id={`${inputId}-option-${safeKey}-${index}`}
                key={`${key}-${index}`}
                role="option"
                onClick={() => onChange(option)}
                style={{
                  color: navigationIndex.current === index ? 'red' : 'white',
                }}
              >
                {getOptionLabel(option)}
              </li>
            );
          })}
        </ul>
      ) : null}
      {!isLoading && error && (
        <span role="alert">
          {errorText ? errorText(error) : 'Unable to load options'}
        </span>
      )}
      {!isLoading && !error && query.length >= minQueryLength && options.length === 0 && (
        <span role="status">{noOptionsText ?? 'No options'}</span>
      )}
      {isLoading && <span role="status">{loadingText ?? 'Loading…'}</span>}
    </div>
  );
}
