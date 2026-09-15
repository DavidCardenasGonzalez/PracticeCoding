import { describe, expect, it } from 'vitest';

import {
  isPalindrome,
  maxContainerArea,
  pairWithTargetSum,
  removeDuplicates,
  reverseInPlace,
} from '../src/index.js';

describe('reverseInPlace', () => {
  it('reverses even-length and odd-length arrays', () => {
    const even = [1, 2, 3, 4];
    const odd = [1, 2, 3, 4, 5];

    reverseInPlace(even);
    reverseInPlace(odd);

    expect(even).toEqual([4, 3, 2, 1]);
    expect(odd).toEqual([5, 4, 3, 2, 1]);
  });

  it('handles empty and single-element arrays', () => {
    const empty: number[] = [];
    const single = [7];

    reverseInPlace(empty);
    reverseInPlace(single);

    expect(empty).toEqual([]);
    expect(single).toEqual([7]);
  });
});

describe('isPalindrome', () => {
  it('ignores ASCII punctuation, spaces, and letter casing', () => {
    expect(isPalindrome('A man, a plan, a canal: Panama')).toBe(true);
    expect(isPalindrome('No lemon, no melon!')).toBe(true);
  });

  it('keeps digits significant and identifies mismatches', () => {
    expect(isPalindrome('1a2a1')).toBe(true);
    expect(isPalindrome('1a2')).toBe(false);
    expect(isPalindrome('race a car')).toBe(false);
  });

  it('accepts empty strings and strings without alphanumeric characters', () => {
    expect(isPalindrome('')).toBe(true);
    expect(isPalindrome('... --- ...')).toBe(true);
  });
});

describe('pairWithTargetSum', () => {
  it('finds a pair at the boundaries or within the array', () => {
    expect(pairWithTargetSum([1, 2, 4, 6, 10], 11)).toEqual([0, 4]);
    expect(pairWithTargetSum([1, 2, 4, 6, 10], 8)).toEqual([1, 3]);
  });

  it('supports negative numbers and duplicate values', () => {
    expect(pairWithTargetSum([-8, -3, 1, 4, 9], 1)).toEqual([1, 3]);
    expect(pairWithTargetSum([1, 2, 2, 5], 4)).toEqual([1, 2]);
  });

  it('returns null when two different elements cannot form the target', () => {
    expect(pairWithTargetSum([1, 3, 5], 20)).toBeNull();
    expect(pairWithTargetSum([4], 8)).toBeNull();
    expect(pairWithTargetSum([], 0)).toBeNull();
  });
});

describe('removeDuplicates', () => {
  it('compacts repeated values into a unique prefix', () => {
    const items = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];

    const uniqueCount = removeDuplicates(items);

    expect(uniqueCount).toBe(5);
    expect(items.slice(0, uniqueCount)).toEqual([0, 1, 2, 3, 4]);
  });

  it('handles arrays that are empty or already unique', () => {
    const empty: number[] = [];
    const unique = [-2, 0, 3];

    expect(removeDuplicates(empty)).toBe(0);
    expect(removeDuplicates(unique)).toBe(3);
    expect(unique).toEqual([-2, 0, 3]);
  });

  it('handles an array containing one repeated value', () => {
    const items = [5, 5, 5, 5];

    const uniqueCount = removeDuplicates(items);

    expect(uniqueCount).toBe(1);
    expect(items.slice(0, uniqueCount)).toEqual([5]);
  });
});

describe('maxContainerArea', () => {
  it('finds the maximum area when the best lines are not adjacent', () => {
    expect(maxContainerArea([1, 8, 6, 2, 5, 4, 8, 3, 7])).toBe(49);
  });

  it('handles equal heights and a descending sequence', () => {
    expect(maxContainerArea([5, 5])).toBe(5);
    expect(maxContainerArea([5, 4, 3, 2, 1])).toBe(6);
  });

  it('returns zero when no container can be formed', () => {
    expect(maxContainerArea([])).toBe(0);
    expect(maxContainerArea([10])).toBe(0);
    expect(maxContainerArea([0, 4, 0])).toBe(0);
  });
});
