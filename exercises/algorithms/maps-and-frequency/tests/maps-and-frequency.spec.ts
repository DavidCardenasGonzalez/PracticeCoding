import { describe, expect, it } from 'vitest';

import {
  canConstruct,
  countFrequencies,
  firstUniqueValue,
  groupAnagrams,
  topKFrequent,
} from '../src/index.js';

describe('countFrequencies', () => {
  it('counts repeated values in first-seen order', () => {
    const result = countFrequencies(['red', 'blue', 'red', 'green', 'blue', 'red']);

    expect([...result.entries()]).toEqual([
      ['red', 3],
      ['blue', 2],
      ['green', 1],
    ]);
  });

  it('supports non-string keys and empty input', () => {
    const shared = { id: 1 };

    expect([...countFrequencies([shared, shared, { id: 1 }]).values()]).toEqual([2, 1]);
    expect([...countFrequencies<number>([])]).toEqual([]);
  });
});

describe('firstUniqueValue', () => {
  it('returns the first unique value rather than the smallest one', () => {
    expect(firstUniqueValue([9, 4, 9, 2, 4, 7])).toBe(2);
  });

  it('handles a unique first value, no unique value, and empty input', () => {
    expect(firstUniqueValue([8, 3, 3])).toBe(8);
    expect(firstUniqueValue([5, 5, 1, 1])).toBeNull();
    expect(firstUniqueValue([])).toBeNull();
  });
});

describe('canConstruct', () => {
  it('consumes each source character no more than once', () => {
    expect(canConstruct('hello', 'oleh world')).toBe(true);
    expect(canConstruct('hello', 'helo')).toBe(false);
  });

  it('treats case, spaces, and punctuation as significant', () => {
    expect(canConstruct('Aa!', '!aA')).toBe(true);
    expect(canConstruct('AA', 'Aa')).toBe(false);
    expect(canConstruct('a a', 'aa')).toBe(false);
  });

  it('can always construct an empty target', () => {
    expect(canConstruct('', '')).toBe(true);
    expect(canConstruct('', 'anything')).toBe(true);
  });
});

describe('groupAnagrams', () => {
  it('groups anagrams while preserving both required orders', () => {
    expect(groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat'])).toEqual([
      ['eat', 'tea', 'ate'],
      ['tan', 'nat'],
      ['bat'],
    ]);
  });

  it('handles repeated words, empty strings, and empty input', () => {
    expect(groupAnagrams(['', 'a', '', 'a', 'b'])).toEqual([
      ['', ''],
      ['a', 'a'],
      ['b'],
    ]);
    expect(groupAnagrams([])).toEqual([]);
  });
});

describe('topKFrequent', () => {
  it('ranks by frequency from highest to lowest', () => {
    expect(topKFrequent([1, 1, 1, 2, 2, 3], 2)).toEqual([1, 2]);
  });

  it('breaks frequency ties by first appearance', () => {
    expect(topKFrequent([4, 2, 4, 2, 3, 3], 3)).toEqual([4, 2, 3]);
    expect(topKFrequent([8, 9, 8, 7, 9, 7], 2)).toEqual([8, 9]);
  });

  it('supports negative values and requesting every distinct value', () => {
    expect(topKFrequent([-1, 2, -1, 3], 3)).toEqual([-1, 2, 3]);
  });
});
