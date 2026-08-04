// @vitest-environment jsdom

import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AsyncCombobox } from '../src/index.js';
import {
  ada,
  createProps,
  deferred,
  grace,
  renderCombobox,
  type Person,
} from './test-fixture.js';

describe('async request lifecycle', () => {
  afterEach(() => vi.useRealTimers());

  it('debounces a query and exposes its AbortSignal', async () => {
    vi.useFakeTimers();
    const loadOptions = vi.fn(async () => [ada]);
    renderCombobox({ loadOptions, debounceMs: 100 });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ad' } });
    await act(() => vi.advanceTimersByTimeAsync(99));
    expect(loadOptions).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(loadOptions).toHaveBeenCalledTimes(1);
    expect(loadOptions).toHaveBeenCalledWith(
      'ad',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('does not search below minQueryLength and aborts active work when dropping below it', async () => {
    vi.useFakeTimers();
    const pending = deferred<ReadonlyArray<Person>>();
    const loadOptions = vi
      .fn<
        (
          query: string,
          context: { signal: AbortSignal },
        ) => Promise<ReadonlyArray<Person>>
      >()
      .mockImplementation(() => pending.promise);
    renderCombobox({ loadOptions, debounceMs: 0, minQueryLength: 2 });
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'ad' } });
    await act(() => vi.runAllTimersAsync());
    const signal = loadOptions.mock.calls[0]?.[1].signal;
    expect(signal?.aborted).toBe(false);

    fireEvent.change(input, { target: { value: 'a' } });
    expect(signal?.aborted).toBe(true);
    expect(loadOptions).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('aborts the previous query and ignores its late response', async () => {
    vi.useFakeTimers();
    const first = deferred<ReadonlyArray<Person>>();
    const second = deferred<ReadonlyArray<Person>>();
    const loadOptions = vi
      .fn<
        (
          query: string,
          context: { signal: AbortSignal },
        ) => Promise<ReadonlyArray<Person>>
      >()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    renderCombobox({ loadOptions, debounceMs: 0 });
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'a' } });
    await act(() => vi.runAllTimersAsync());
    const firstSignal = loadOptions.mock.calls[0]?.[1].signal;
    fireEvent.change(input, { target: { value: 'gr' } });
    await act(() => vi.runAllTimersAsync());
    expect(firstSignal?.aborted).toBe(true);

    await act(async () => second.resolve([grace]));
    expect(screen.getByRole('option', { name: 'Grace Hopper' })).toBeVisible();
    await act(async () => first.resolve([ada]));
    expect(screen.queryByRole('option', { name: 'Ada Lovelace' })).toBeNull();
    expect(screen.getByRole('option', { name: 'Grace Hopper' })).toBeVisible();
  });

  it('aborts in-flight work on unmount', async () => {
    vi.useFakeTimers();
    const pending = deferred<ReadonlyArray<Person>>();
    const loadOptions = vi
      .fn<
        (
          query: string,
          context: { signal: AbortSignal },
        ) => Promise<ReadonlyArray<Person>>
      >()
      .mockImplementation(() => pending.promise);
    const view = renderCombobox({ loadOptions, debounceMs: 0 });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ada' } });
    await act(() => vi.runAllTimersAsync());
    const signal = loadOptions.mock.calls[0]?.[1].signal;
    view.unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('waits for IME composition to finish and searches the final value once', async () => {
    vi.useFakeTimers();
    const loadOptions = vi.fn<
      (query: string, context: { signal: AbortSignal }) => Promise<ReadonlyArray<Person>>
    >(async () => [ada]);
    renderCombobox({ loadOptions, debounceMs: 10 });
    const input = screen.getByRole('combobox');

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'あ' } });
    await act(() => vi.advanceTimersByTimeAsync(20));
    expect(loadOptions).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input, { data: 'あ' });
    await act(() => vi.advanceTimersByTimeAsync(10));
    expect(loadOptions).toHaveBeenCalledOnce();
    expect(loadOptions.mock.calls[0]?.[0]).toBe('あ');
  });

  it.each([
    ['debounceMs', -1],
    ['debounceMs', Number.NaN],
    ['minQueryLength', -1],
    ['cacheTimeMs', Number.POSITIVE_INFINITY],
  ] as const)('rejects invalid %s configuration', (property, value) => {
    const props = createProps({ [property]: value });
    expect(() => renderCombobox(props)).toThrow(RangeError);
  });

  it('does not begin requests while disabled', async () => {
    vi.useFakeTimers();
    const loadOptions = vi.fn(async () => [ada]);
    renderCombobox({ loadOptions, disabled: true, debounceMs: 0 });
    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
    fireEvent.change(input, { target: { value: 'ada' } });
    await act(() => vi.runAllTimersAsync());
    expect(loadOptions).not.toHaveBeenCalled();
  });

  it('keeps the public component generic at runtime', () => {
    const props = createProps();
    expect(() => <AsyncCombobox<Person> {...props} />).not.toThrow();
  });
});
