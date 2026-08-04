import { render } from '@testing-library/react';
import { vi } from 'vitest';

import { AsyncCombobox, type AsyncComboboxProps } from '../src/index.js';

export interface Person {
  readonly id: string;
  readonly name: string;
}

export const ada: Person = { id: 'user:1', name: 'Ada Lovelace' };
export const grace: Person = { id: 'user 2', name: 'Grace Hopper' };
export const linus: Person = { id: 'user/3', name: 'Linus Torvalds' };

export function createProps(
  overrides: Partial<AsyncComboboxProps<Person>> = {},
): AsyncComboboxProps<Person> {
  return {
    label: 'Assignee',
    loadOptions: vi.fn(async () => [ada, grace, linus]),
    getOptionKey: (person) => person.id,
    getOptionLabel: (person) => person.name,
    value: null,
    onChange: vi.fn(),
    debounceMs: 20,
    ...overrides,
  };
}

export function renderCombobox(overrides: Partial<AsyncComboboxProps<Person>> = {}) {
  const props = createProps(overrides);
  return { props, ...render(<AsyncCombobox<Person> {...props} />) };
}

export interface Deferred<T> {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
  readonly reject: (reason?: unknown) => void;
}

export function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}
