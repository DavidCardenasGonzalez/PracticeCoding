// @vitest-environment jsdom

import { act, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ada, grace, linus, renderCombobox } from './test-fixture.js';

describe('ARIA and keyboard interaction', () => {
  afterEach(() => vi.useRealTimers());

  async function openResults() {
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } });
    await act(() => vi.runAllTimersAsync());
  }

  it('starts with a correctly labelled, collapsed combobox', () => {
    renderCombobox({ id: 'assignee-input' });
    const input = screen.getByRole('combobox', { name: 'Assignee' });
    expect(input).toHaveAttribute('id', 'assignee-input');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-controls', 'assignee-input-listbox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('renders a linked listbox and DOM-safe unique option IDs', async () => {
    vi.useFakeTimers();
    renderCombobox({ debounceMs: 0 });
    await openResults();
    const input = screen.getByRole('combobox');
    const listbox = screen.getByRole('listbox');
    expect(listbox.id).toBe(input.getAttribute('aria-controls'));
    const ids = within(listbox)
      .getAllByRole('option')
      .map((option) => option.id);
    expect(new Set(ids).size).toBe(3);
    expect(ids.every((id) => /^[A-Za-z][\w:.-]*$/.test(id))).toBe(true);
  });

  it('cycles with arrows and exposes the active descendant', async () => {
    vi.useFakeTimers();
    renderCombobox({ debounceMs: 0 });
    await openResults();
    const input = screen.getByRole('combobox');
    const options = screen.getAllByRole('option');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', options[0]?.id);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveAttribute('aria-activedescendant', options[2]?.id);
  });

  it('supports Home, End, Enter, Escape, and Tab semantics', async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    renderCombobox({ debounceMs: 0, onChange });
    await openResults();
    const input = screen.getByRole('combobox');

    fireEvent.keyDown(input, { key: 'End' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(linus);
    expect(input).toHaveValue('Linus Torvalds');
    expect(input).toHaveAttribute('aria-expanded', 'false');

    fireEvent.change(input, { target: { value: 'a' } });
    await act(() => vi.runAllTimersAsync());
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveValue('a');
    expect(input).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Tab' });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('activates on pointer movement and selects on mouse down without losing focus', async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    renderCombobox({ debounceMs: 0, onChange });
    await openResults();
    const input = screen.getByRole('combobox');
    input.focus();
    const option = screen.getByRole('option', { name: 'Grace Hopper' });

    fireEvent.pointerMove(option);
    expect(input).toHaveAttribute('aria-activedescendant', option.id);
    fireEvent.mouseDown(option);
    expect(onChange).toHaveBeenCalledWith(grace);
    expect(input).toHaveFocus();
  });

  it('allows accessible custom status text', async () => {
    vi.useFakeTimers();
    renderCombobox({
      debounceMs: 0,
      loadOptions: vi.fn(async () => []),
      loadingText: 'Searching people…',
      noOptionsText: 'Nobody found',
    });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'x' } });
    await act(() => vi.runAllTimersAsync());
    expect(screen.getByRole('status')).toHaveTextContent('Nobody found');
  });

  it('renders each result label exactly once', async () => {
    vi.useFakeTimers();
    renderCombobox({ debounceMs: 0, loadOptions: vi.fn(async () => [ada]) });
    await openResults();
    expect(screen.getAllByText('Ada Lovelace')).toHaveLength(1);
  });
});
