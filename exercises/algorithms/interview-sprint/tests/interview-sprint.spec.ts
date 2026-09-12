import { describe, expect, it } from 'vitest';

import {
  canReachEnd,
  countIslands,
  firstOccurrence,
  generateParentheses,
  hasNearbyDuplicate,
  insertInterval,
  longestSubarrayWithTwoValues,
  rangeSumQueries,
  removeStars,
  sortedSquares,
} from '../src/index.js';

describe('hasNearbyDuplicate', () => {
  it('checks the distance between equal values', () => {
    expect(hasNearbyDuplicate([1, 2, 3, 1], 3)).toBe(true);
    expect(hasNearbyDuplicate([1, 2, 3, 1], 2)).toBe(false);
  });

  it('handles repeated neighbors, zero distance, and empty input', () => {
    expect(hasNearbyDuplicate([4, 4], 1)).toBe(true);
    expect(hasNearbyDuplicate([4, 4], 0)).toBe(false);
    expect(hasNearbyDuplicate([], 5)).toBe(false);
  });
});

describe('sortedSquares', () => {
  it('orders squares from mixed negative and positive values', () => {
    expect(sortedSquares([-4, -1, 0, 3, 10])).toEqual([0, 1, 9, 16, 100]);
  });

  it('handles all-negative and empty arrays', () => {
    expect(sortedSquares([-7, -3, -1])).toEqual([1, 9, 49]);
    expect(sortedSquares([])).toEqual([]);
  });
});

describe('longestSubarrayWithTwoValues', () => {
  it('contracts when a third distinct value enters', () => {
    expect(longestSubarrayWithTwoValues([1, 2, 1, 2, 3])).toBe(4);
    expect(longestSubarrayWithTwoValues([0, 1, 2, 2])).toBe(3);
  });

  it('handles one repeated value and empty input', () => {
    expect(longestSubarrayWithTwoValues([5, 5, 5])).toBe(3);
    expect(longestSubarrayWithTwoValues([])).toBe(0);
  });
});

describe('removeStars', () => {
  it('removes the closest remaining character for every star', () => {
    expect(removeStars('leet**cod*e')).toBe('lecoe');
    expect(removeStars('erase*****')).toBe('');
  });

  it('returns an unchanged string when there are no stars', () => {
    expect(removeStars('interview')).toBe('interview');
  });
});

describe('firstOccurrence', () => {
  it('returns the first index among duplicate targets', () => {
    expect(firstOccurrence([1, 2, 2, 2, 4], 2)).toBe(1);
    expect(firstOccurrence([3, 3, 3], 3)).toBe(0);
  });

  it('returns -1 when the target is absent or input is empty', () => {
    expect(firstOccurrence([1, 3, 5], 2)).toBe(-1);
    expect(firstOccurrence([], 2)).toBe(-1);
  });
});

describe('insertInterval', () => {
  it('merges every overlapping interval', () => {
    expect(insertInterval([[1, 3], [6, 9]], [2, 5])).toEqual([[1, 5], [6, 9]]);
    expect(insertInterval([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8])).toEqual([
      [1, 2],
      [3, 10],
      [12, 16],
    ]);
  });

  it('inserts before, after, or into empty input', () => {
    expect(insertInterval([[3, 5]], [1, 2])).toEqual([[1, 2], [3, 5]]);
    expect(insertInterval([[1, 2]], [3, 4])).toEqual([[1, 2], [3, 4]]);
    expect(insertInterval([], [2, 4])).toEqual([[2, 4]]);
  });
});

describe('rangeSumQueries', () => {
  it('answers several inclusive ranges', () => {
    expect(rangeSumQueries([2, -1, 4, 3], [[0, 2], [1, 3], [2, 2]])).toEqual([5, 6, 4]);
  });

  it('supports no queries and a full-array query', () => {
    expect(rangeSumQueries([1, 2, 3], [])).toEqual([]);
    expect(rangeSumQueries([1, 2, 3], [[0, 2]])).toEqual([6]);
  });
});

describe('countIslands', () => {
  it('counts horizontal and vertical components but not diagonal connections', () => {
    expect(countIslands([
      ['1', '1', '0'],
      ['0', '1', '0'],
      ['1', '0', '1'],
    ])).toBe(3);
  });

  it('handles all-water and empty grids', () => {
    expect(countIslands([['0', '0'], ['0', '0']])).toBe(0);
    expect(countIslands([])).toBe(0);
  });
});

describe('generateParentheses', () => {
  it('generates valid results in opening-first order', () => {
    expect(generateParentheses(3)).toEqual([
      '((()))',
      '(()())',
      '(())()',
      '()(())',
      '()()()',
    ]);
  });

  it('handles one and zero pairs', () => {
    expect(generateParentheses(1)).toEqual(['()']);
    expect(generateParentheses(0)).toEqual(['']);
  });
});

describe('canReachEnd', () => {
  it('distinguishes reachable and blocked arrays', () => {
    expect(canReachEnd([2, 3, 1, 1, 4])).toBe(true);
    expect(canReachEnd([3, 2, 1, 0, 4])).toBe(false);
  });

  it('handles an early large jump, one item, and empty input', () => {
    expect(canReachEnd([5, 0, 0, 0])).toBe(true);
    expect(canReachEnd([0])).toBe(true);
    expect(canReachEnd([])).toBe(true);
  });
});
