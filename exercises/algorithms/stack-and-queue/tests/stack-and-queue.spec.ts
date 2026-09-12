import { describe, expect, it } from 'vitest';

import {
  ArrayQueue,
  evaluatePostfix,
  firstUniqueAfterEachCharacter,
  hasBalancedBrackets,
  nextGreaterValues,
} from '../src/index.js';

describe('hasBalancedBrackets', () => {
  it('accepts correctly nested and adjacent pairs', () => {
    expect(hasBalancedBrackets('([]{})')).toBe(true);
    expect(hasBalancedBrackets('()[]{}')).toBe(true);
  });

  it('rejects incorrect nesting and missing partners', () => {
    expect(hasBalancedBrackets('([)]')).toBe(false);
    expect(hasBalancedBrackets('(((')).toBe(false);
    expect(hasBalancedBrackets(']')).toBe(false);
  });

  it('accepts an empty string', () => {
    expect(hasBalancedBrackets('')).toBe(true);
  });
});

describe('evaluatePostfix', () => {
  it('evaluates expressions with multiple operations', () => {
    expect(evaluatePostfix(['2', '1', '+', '3', '*'])).toBe(9);
    expect(evaluatePostfix(['4', '13', '5', '/', '+'])).toBe(6);
  });

  it('preserves operand order for subtraction and division', () => {
    expect(evaluatePostfix(['5', '2', '-'])).toBe(3);
    expect(evaluatePostfix(['20', '4', '/'])).toBe(5);
  });

  it('truncates division toward zero and supports negative integers', () => {
    expect(evaluatePostfix(['7', '-3', '/'])).toBe(-2);
    expect(evaluatePostfix(['-7', '3', '/'])).toBe(-2);
    expect(evaluatePostfix(['-12'])).toBe(-12);
  });
});

describe('nextGreaterValues', () => {
  it('finds the first greater value rather than the greatest later value', () => {
    expect(nextGreaterValues([2, 1, 2, 4, 3])).toEqual([4, 2, 4, -1, -1]);
  });

  it('requires a strictly greater value', () => {
    expect(nextGreaterValues([2, 2, 3])).toEqual([3, 3, -1]);
  });

  it('handles descending and empty arrays', () => {
    expect(nextGreaterValues([5, 4, 3])).toEqual([-1, -1, -1]);
    expect(nextGreaterValues([])).toEqual([]);
  });
});

describe('ArrayQueue', () => {
  it('processes values in FIFO order', () => {
    const queue = new ArrayQueue<number>();

    queue.enqueue(10);
    queue.enqueue(20);
    queue.enqueue(30);

    expect(queue.peek()).toBe(10);
    expect(queue.dequeue()).toBe(10);
    expect(queue.dequeue()).toBe(20);
    expect(queue.dequeue()).toBe(30);
  });

  it('tracks size and emptiness through reuse', () => {
    const queue = new ArrayQueue<string>();

    expect(queue.size).toBe(0);
    expect(queue.isEmpty).toBe(true);
    queue.enqueue('first');
    expect(queue.size).toBe(1);
    expect(queue.isEmpty).toBe(false);
    expect(queue.dequeue()).toBe('first');
    queue.enqueue('second');
    expect(queue.peek()).toBe('second');
    expect(queue.size).toBe(1);
  });

  it('returns undefined for empty operations', () => {
    const queue = new ArrayQueue<number>();

    expect(queue.peek()).toBeUndefined();
    expect(queue.dequeue()).toBeUndefined();
    expect(queue.size).toBe(0);
  });
});

describe('firstUniqueAfterEachCharacter', () => {
  it('reports the earliest current character with frequency one', () => {
    expect(firstUniqueAfterEachCharacter('aabc')).toEqual(['a', null, 'b', 'b']);
    expect(firstUniqueAfterEachCharacter('abad')).toEqual(['a', 'a', 'b', 'b']);
  });

  it('removes several invalid candidates from the front when needed', () => {
    expect(firstUniqueAfterEachCharacter('abcabc')).toEqual([
      'a',
      'a',
      'a',
      'b',
      'c',
      null,
    ]);
  });

  it('handles empty input', () => {
    expect(firstUniqueAfterEachCharacter('')).toEqual([]);
  });
});
