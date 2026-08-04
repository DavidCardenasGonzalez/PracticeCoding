# Async Combobox — Advanced React

Implement `AsyncCombobox<T>`, a generic, controlled, accessible component that searches
remote options. The starter component contains only the visual shell; the tests are the
executable specification and must not be modified.

This challenge is designed for senior-level React 19 practice: effect cleanup, derived
state, asynchronous concurrency, stable identity, accessibility, and keyboard/composition
events. Do not install a combobox or data-fetching library.

## How to work

```bash
npm install
npm run test:react:watch
npm run typecheck
npm run dev                 # open the visual playground
```

The implementation must live in `src/`. You may create hooks, reducers, or internal
modules, but keep the public API exported from `src/index.ts` unchanged.

## Public API

```tsx
<AsyncCombobox<User>
  label="Assignee"
  loadOptions={(query, { signal }) => searchUsers(query, signal)}
  getOptionKey={(user) => user.id}
  getOptionLabel={(user) => user.name}
  value={assignee}
  onChange={setAssignee}
  debounceMs={250}
  minQueryLength={2}
  cacheTimeMs={30_000}
/>
```

Defaults: `debounceMs = 250`, `minQueryLength = 1`, `cacheTimeMs = 30_000`,
`loadingText = "Loading…"`, and `noOptionsText = "No options"`. The default error text is
`Unable to load options`; `errorText` can customize it.

## Functional rules

### Search and concurrency

- When the user types, wait for the debounce before calling `loadOptions`. Do not search
  when the input is shorter than `minQueryLength`.
- Every request receives an `AbortSignal`. Abort a request when it is replaced by another,
  when the input drops below the minimum, or when the component unmounts.
- Only the latest request may update the UI, even if an older promise ignores cancellation
  and resolves later. An `AbortError` must not be shown as an error.
- Do not search during IME composition (`compositionstart`/`compositionend`). Process the
  final value exactly once when composition ends.
- `debounceMs`, `minQueryLength`, and `cacheTimeMs` must be finite, non-negative numbers;
  throw `RangeError` during render when any value is invalid.

### Cache

- Cache successful results by exact query for `cacheTimeMs`. A fresh hit is displayed
  without another debounce or request. `cacheTimeMs = 0` disables caching.
- Never cache errors or aborts. An expired entry must be requested again.
- The cache belongs to the component instance and must not be global.

### Controlled value

- `value` is the single source of truth for the selection. When the parent changes it, the
  input reflects the selected option's label.
- Selecting an option calls `onChange(option)` and immediately reflects its label, but must
  not invent a new selection when the parent does not update `value`.
- Editing the text of a selected option calls `onChange(null)` exactly once. The accessible
  `Clear selection` button also clears and returns focus to the input.
- `disabled` blocks the input and all searches, and hides the clear button.

### Visual states and accessibility

- Use the ARIA combobox pattern: labelled input, `aria-expanded`, `aria-controls`,
  `aria-activedescendant`, a `listbox`, and options with `role="option"`.
- While loading, show `Loading…`; for an empty result, show `No options`. A rejection shows
  the error. These states use `role="status"` except errors, which use `role="alert"`.
- Option keys may contain spaces or punctuation: generate safe, unique DOM IDs without
  assuming the key is already a valid ID.
- Duplicate keys in a response are invalid data: show an error through `errorText` and do
  not render ambiguous options.

### Keyboard

- `ArrowDown`/`ArrowUp` open the list and move through options circularly.
- `Home`/`End` move the active option to the first/last result when the list is open.
- `Enter` selects the active option. `Escape` closes without changing selection or text.
  `Tab` closes without selecting.
- Moving the pointer over an option activates it; `mousedown` selects without losing input
  focus before the event can be applied.

## Quality criteria

- No state updates after unmount and no unhandled promise rejections.
- No timers or live requests after effect cleanup.
- Changing callback references from the parent must not restart an in-flight request.
- The solution must pass strict TypeScript, ESLint, and the tests without additional runtime
  dependencies.

## Out of scope

Multiple selection, virtualization, pagination, streaming SSR, and floating popup
positioning are not part of this challenge.
