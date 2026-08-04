// @vitest-environment jsdom

import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AsyncCombobox } from '../src/index.js';
import { ada, createProps, grace, type Person } from './test-fixture.js';

describe('controlled value contract', () => {
  afterEach(() => vi.useRealTimers());

  it('synchronizes the input when value changes externally', () => {
    const props = createProps({ value: ada });
    const view = render(<AsyncCombobox<Person> {...props} />);
    expect(screen.getByRole('combobox')).toHaveValue('Ada Lovelace');

    view.rerender(<AsyncCombobox<Person> {...props} value={grace} />);
    expect(screen.getByRole('combobox')).toHaveValue('Grace Hopper');
    view.rerender(<AsyncCombobox<Person> {...props} value={null} />);
    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('clears the controlled selection once when its label is edited', () => {
    const onChange = vi.fn();
    const props = createProps({ value: ada, onChange });
    render(<AsyncCombobox<Person> {...props} />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'Ada' } });
    fireEvent.change(input, { target: { value: 'Ad' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('offers a clear button that clears and restores input focus', async () => {
    const user = userEventForRealTimers();
    const onChange = vi.fn();
    render(<AsyncCombobox<Person> {...createProps({ value: ada, onChange })} />);
    const clear = screen.getByRole('button', { name: 'Clear selection' });
    await user.click(clear);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('works in a real controlled parent flow', async () => {
    vi.useFakeTimers();
    function Harness() {
      const [value, setValue] = useState<Person | null>(null);
      return (
        <AsyncCombobox<Person>
          {...createProps({ value, onChange: setValue, debounceMs: 0 })}
        />
      );
    }
    render(<Harness />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'gr' } });
    await act(() => vi.runAllTimersAsync());
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue('Grace Hopper');
  });

  it('disables both controls and hides the clear affordance from interaction', () => {
    const props = createProps({ value: ada, disabled: true });
    render(<AsyncCombobox<Person> {...props} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull();
  });
});

function userEventForRealTimers() {
  return {
    async click(element: HTMLElement) {
      fireEvent.click(element);
      await Promise.resolve();
    },
  };
}
