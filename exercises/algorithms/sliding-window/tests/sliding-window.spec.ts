import { describe, expect, it } from 'vitest';

import {
  findAnagramStartIndices,
  longestOnesAfterFlips,
  longestUniqueSubstringLength,
  maxFixedWindowSum,
  minSubarrayLength,
} from '../src/index.js';

describe('maxFixedWindowSum', () => {
  it('finds the greatest sum among equal-size windows', () => {
    expect(maxFixedWindowSum([2, 1, 5, 1, 3, 2], 3)).toBe(9);
    expect(maxFixedWindowSum([1, 9, 2, 3, 8], 2)).toBe(11);
  });

  it('handles negative values without assuming zero is the answer', () => {
    expect(maxFixedWindowSum([-4, -2, -7, -1], 2)).toBe(-6);
  });

  it('supports windows of one element or the complete array', () => {
    expect(maxFixedWindowSum([4, 1, 8], 1)).toBe(8);
    expect(maxFixedWindowSum([4, 1, 8], 3)).toBe(13);
  });
});

describe('longestUniqueSubstringLength', () => {
  it('finds a unique window between repeated characters', () => {
    expect(longestUniqueSubstringLength('abcabcbb')).toBe(3);
    expect(longestUniqueSubstringLength('pwwkew')).toBe(3);
  });

  it('handles a repeated single character and a fully unique string', () => {
    expect(longestUniqueSubstringLength('bbbbb')).toBe(1);
    expect(longestUniqueSubstringLength('typescript')).toBe(8);
  });

  it('returns zero for an empty string', () => {
    expect(longestUniqueSubstringLength('')).toBe(0);
  });
});

describe('minSubarrayLength', () => {
  it('shrinks a qualifying window to its minimum length', () => {
    expect(minSubarrayLength(7, [2, 3, 1, 2, 4, 3])).toBe(2);
    expect(minSubarrayLength(11, [1, 2, 3, 4, 5])).toBe(3);
  });

  it('returns one when a single value reaches the target', () => {
    expect(minSubarrayLength(4, [1, 4, 2])).toBe(1);
  });

  it('returns zero when no window reaches the target', () => {
    expect(minSubarrayLength(100, [1, 2, 3])).toBe(0);
    expect(minSubarrayLength(5, [])).toBe(0);
  });
});

describe('findAnagramStartIndices', () => {
  it('finds separated anagram windows', () => {
    expect(findAnagramStartIndices('cbaebabacd', 'abc')).toEqual([0, 6]);
  });

  it('finds overlapping matches', () => {
    expect(findAnagramStartIndices('abab', 'ab')).toEqual([0, 1, 2]);
    expect(findAnagramStartIndices('aaaa', 'aa')).toEqual([0, 1, 2]);
  });

  it('returns no indexes when the pattern is longer or absent', () => {
    expect(findAnagramStartIndices('ab', 'abc')).toEqual([]);
    expect(findAnagramStartIndices('abcdef', 'zz')).toEqual([]);
  });
});

describe('longestOnesAfterFlips', () => {
  it('finds the longest valid binary window', () => {
    expect(longestOnesAfterFlips([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2)).toBe(6);
  });

  it('supports zero flips and more flips than zeroes', () => {
    expect(longestOnesAfterFlips([1, 1, 0, 1, 1, 1], 0)).toBe(3);
    expect(longestOnesAfterFlips([0, 1, 0], 5)).toBe(3);
  });

  it('handles all-zero and empty arrays', () => {
    expect(longestOnesAfterFlips([0, 0, 0], 1)).toBe(1);
    expect(longestOnesAfterFlips([], 2)).toBe(0);
  });
});
