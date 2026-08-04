// @vitest-environment jsdom

import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ada, deferred, renderCombobox, type Person } from './test-fixture.js';

describe('cache and visible status', () => {
  afterEach(() => vi.useRealTimers());

  async function search(query: string): Promise<void> {
    fireEvent.change(screen.getByRole('combobox'), { target: { value: query } });
    await act(() => vi.runAllTimersAsync());
  }

  it('shows loading, empty, and error states with the correct live roles', async () => {
    vi.useFakeTimers();
    const pending = deferred<ReadonlyArray<Person>>();
    const loadOptions = vi.fn(() => pending.promise);
    renderCombobox({ loadOptions, debounceMs: 0 });

    await search('ada');
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    await act(async () => pending.resolve([]));
    expect(screen.getByRole('status')).toHaveTextContent('No options');

    const failure = deferred<ReadonlyArray<Person>>();
    loadOptions.mockImplementationOnce(() => failure.promise);
    await search('broken');
    await act(async () => failure.reject(new Error('network')));
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load options');
  });

  it('passes failures to errorText', async () => {
    vi.useFakeTimers();
    const error = new Error('gateway offline');
    renderCombobox({
      debounceMs: 0,
      loadOptions: vi.fn(async () => Promise.reject(error)),
      errorText: (reason) =>
        reason instanceof Error ? `Search failed: ${reason.message}` : 'Search failed',
    });
    await search('ada');
    expect(screen.getByRole('alert')).toHaveTextContent('Search failed: gateway offline');
  });

  it('reuses a fresh cache entry immediately and refreshes it after expiry', async () => {
    vi.useFakeTimers();
    const loadOptions = vi.fn(async () => [ada]);
    renderCombobox({ loadOptions, debounceMs: 50, cacheTimeMs: 1_000 });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ada' } });
    await act(() => vi.advanceTimersByTimeAsync(50));
    expect(loadOptions).toHaveBeenCalledOnce();
    expect(await screen.findByRole('option', { name: 'Ada Lovelace' })).toBeVisible();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ada' } });
    expect(screen.getByRole('option', { name: 'Ada Lovelace' })).toBeVisible();
    expect(loadOptions).toHaveBeenCalledOnce();

    await act(() => vi.advanceTimersByTimeAsync(1_001));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ada' } });
    await act(() => vi.advanceTimersByTimeAsync(50));
    expect(loadOptions).toHaveBeenCalledTimes(2);
  });

  it('disables caching when cacheTimeMs is zero', async () => {
    vi.useFakeTimers();
    const loadOptions = vi.fn(async () => [ada]);
    renderCombobox({ loadOptions, debounceMs: 0, cacheTimeMs: 0 });
    await search('ada');
    await search('');
    await search('ada');
    expect(loadOptions).toHaveBeenCalledTimes(2);
  });

  it('treats duplicate option keys as an error and renders no ambiguous options', async () => {
    vi.useFakeTimers();
    renderCombobox({
      debounceMs: 0,
      loadOptions: vi.fn(async () => [ada, { ...ada, name: 'Ada Byron' }]),
      errorText: (error) => (error instanceof Error ? error.message : 'Invalid options'),
    });
    await search('ada');
    expect(screen.getByRole('alert')).toHaveTextContent(/duplicate/i);
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
});
