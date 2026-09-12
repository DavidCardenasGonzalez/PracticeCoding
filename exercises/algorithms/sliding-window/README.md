# Sliding Window

Maintain information about a contiguous section of an array or string while its
boundaries move. The goal is to avoid recalculating the entire section after every
movement.

Run this topic with:

```bash
npm run test:algorithms:sliding-window
```

## 1. `maxFixedWindowSum`

Return the greatest sum among all contiguous windows of exactly `windowSize` elements.
The input contains at least `windowSize` elements, and `windowSize` is a positive
integer.

```ts
maxFixedWindowSum([2, 1, 5, 1, 3, 2], 3); // 9, from [5, 1, 3]
```

Target: `O(n)` time and `O(1)` extra space. Calculate the first window once; afterward,
update its sum when one value enters and another leaves.

## 2. `longestUniqueSubstringLength`

Return the length of the longest substring containing no repeated characters.

```ts
longestUniqueSubstringLength('abcabcbb'); // 3, from "abc"
longestUniqueSubstringLength('bbbbb'); // 1
```

Target: `O(n)` time and `O(u)` extra space, where `u` is the number of distinct
characters in the active window.

## 3. `minSubarrayLength`

Given a positive target and an array of positive integers, return the minimum length of
a contiguous subarray whose sum is greater than or equal to the target. Return `0` when
none exists.

```ts
minSubarrayLength(7, [2, 3, 1, 2, 4, 3]); // 2, from [4, 3]
```

Target: `O(n)` time and `O(1)` extra space. Positivity is what makes shrinking the left
side safe.

## 4. `findAnagramStartIndices`

Return every index where an anagram of `pattern` begins in `text`. Both strings contain
only lowercase English letters, and `pattern` is non-empty. Return indexes in ascending
order.

```ts
findAnagramStartIndices('cbaebabacd', 'abc'); // [0, 6]
```

Overlapping matches are valid:

```ts
findAnagramStartIndices('abab', 'ab'); // [0, 1, 2]
```

Target: `O(n + p)` time and `O(1)` extra space because the alphabet has a fixed size.
Do not sort each window.

## 5. `longestOnesAfterFlips`

Given a binary array, return the longest contiguous section containing only `1`s after
changing at most `maxFlips` zeroes into ones. `maxFlips` is a non-negative integer.

```ts
longestOnesAfterFlips([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2); // 6
```

Target: `O(n)` time and `O(1)` extra space. Track how many zeroes are currently inside
the window.

## Rules

- Do not change exported function signatures.
- Do not edit tests to accommodate an implementation.
- Do not mutate inputs.
- Empty arrays and strings are valid except where a problem states stronger input
  constraints.
