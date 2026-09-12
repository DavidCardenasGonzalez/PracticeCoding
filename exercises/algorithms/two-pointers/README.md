# Two Pointers

Use two indexes that move through the same collection instead of repeatedly scanning
it. These exercises cover pointers moving toward each other, moving in the same
direction, and moving according to a greedy decision.

Run this topic with:

```bash
npm run test:algorithms:two-pointers
```

## 1. `reverseInPlace`

Reverse an array of numbers in place. The function returns nothing and must not create
another array proportional to the input size.

```ts
const values = [1, 2, 3, 4];
reverseInPlace(values);
// values is now [4, 3, 2, 1]
```

Target: `O(n)` time and `O(1)` extra space.

## 2. `isPalindrome`

Determine whether a string is a palindrome after ignoring non-alphanumeric ASCII
characters and letter casing. Digits remain significant.

```ts
isPalindrome('A man, a plan, a canal: Panama'); // true
isPalindrome('race a car'); // false
```

Target: `O(n)` time and `O(1)` extra space. Avoid building a cleaned copy of the whole
string.

## 3. `pairWithTargetSum`

Given an array sorted in nondecreasing order, return the indexes of two different
elements whose sum equals `target`. Return `null` if no pair exists. Exactly zero or one
valid pair exists, so no tie-breaking rule is needed.

```ts
pairWithTargetSum([1, 2, 4, 6, 10], 8); // [1, 3]
pairWithTargetSum([1, 3, 5], 20); // null
```

Target: `O(n)` time and `O(1)` extra space. Do not mutate the input.

## 4. `removeDuplicates`

Remove duplicates from a sorted array in place so every value occurs once. Return the
number `k` of unique values. After the function returns, the first `k` positions must
contain those values in sorted order. Values after position `k - 1` do not matter.

```ts
const values = [1, 1, 2, 2, 3];
const k = removeDuplicates(values);
// k === 3 and values.slice(0, k) equals [1, 2, 3]
```

Target: `O(n)` time and `O(1)` extra space. Do not use `Set`.

## 5. `maxContainerArea`

Each array value is the height of a vertical line at that index. Choose two lines that,
together with the horizontal axis, hold the most water. Return that maximum area.

The area between indexes `left` and `right` is:

```text
(right - left) * min(heights[left], heights[right])
```

```ts
maxContainerArea([1, 8, 6, 2, 5, 4, 8, 3, 7]); // 49
```

All heights are non-negative. Arrays with fewer than two elements have area `0`.

Target: `O(n)` time and `O(1)` extra space. Be ready to explain why moving the shorter
line is safe.

## Rules

- Do not change exported function signatures.
- Do not edit the tests to accommodate an implementation.
- Only mutate inputs when the individual problem explicitly requires it.
- Empty arrays and strings are valid inputs.
