# Mixed Interview Sprint

A final 90-minute warm-up covering every pattern in the practice track. Work without
looking at previous solutions and explain each choice aloud as if an interviewer were
present.

Run the complete sprint with:

```bash
npm run test:algorithms:interview-sprint:watch
```

## Suggested timing

| Phase | Time |
| --- | ---: |
| Read all contracts and examples | 5 min |
| Exercises 1–4 | 28 min |
| Exercises 5–7 | 27 min |
| Exercises 8–10 | 25 min |
| Review complexity and edge cases | 5 min |

If an exercise takes more than ten minutes, state the intended approach, leave a short
TODO, and move on. Returning later is better practice than getting stuck.

## 1. Map — `hasNearbyDuplicate`

Return whether two equal values appear at indexes whose distance is at most
`maxDistance`. `maxDistance` is a non-negative integer.

```ts
hasNearbyDuplicate([1, 2, 3, 1], 3); // true
hasNearbyDuplicate([1, 2, 3, 1], 2); // false
```

Target: `O(n)` time and `O(u)` extra space.

## 2. Two pointers — `sortedSquares`

Given a nondecreasing array, return the squares of its values in nondecreasing order.
Do not mutate the input.

```ts
sortedSquares([-4, -1, 0, 3, 10]); // [0, 1, 9, 16, 100]
```

Target: `O(n)` time. Do not sort the result.

## 3. Sliding window — `longestSubarrayWithTwoValues`

Return the maximum length of a contiguous subarray containing at most two distinct
values.

```ts
longestSubarrayWithTwoValues([1, 2, 1, 2, 3]); // 4
```

Target: `O(n)` time and `O(1)` extra space because the active map holds at most three
keys.

## 4. Stack — `removeStars`

Every `*` removes the nearest character to its left that has not already been removed.
Inputs are guaranteed to contain a removable character before every star.

```ts
removeStars('leet**cod*e'); // 'lecoe'
```

Target: `O(n)` time and `O(n)` extra space.

## 5. Binary search — `firstOccurrence`

Return the first index containing `target` in a nondecreasing array, or `-1` when the
target is absent.

```ts
firstOccurrence([1, 2, 2, 2, 4], 2); // 1
```

Target: `O(log n)` time and `O(1)` extra space.

## 6. Intervals — `insertInterval`

The input intervals are sorted by start and do not overlap. Insert `newInterval`, merge
all overlaps, and return sorted, non-overlapping intervals. Touching endpoints count as
overlap. Do not mutate either input.

```ts
insertInterval([[1, 3], [6, 9]], [2, 5]); // [[1, 5], [6, 9]]
```

Target: `O(n)` time and `O(n)` output space.

## 7. Prefix sums — `rangeSumQueries`

Answer multiple inclusive range-sum queries. Each query is `[start, end]` and always
contains valid indexes.

```ts
rangeSumQueries([2, -1, 4, 3], [[0, 2], [1, 3]]); // [5, 6]
```

Target: `O(n + q)` time and `O(n)` extra space. Do not sum every range separately.

## 8. DFS/BFS — `countIslands`

Count connected groups of `'1'` cells in a rectangular grid. Cells connect vertically
and horizontally, not diagonally. Do not mutate the grid.

```ts
countIslands([
  ['1', '1', '0'],
  ['0', '1', '0'],
  ['1', '0', '1'],
]); // 3
```

Target: `O(rows * columns)` time and space.

## 9. Recursion/backtracking — `generateParentheses`

Return every valid string containing `pairs` pairs of parentheses. Generate opening
branches before closing branches so results have deterministic order. For zero pairs,
return `['']`.

```ts
generateParentheses(3);
// ['((()))', '(()())', '(())()', '()(())', '()()()']
```

Build only prefixes that can still become valid; do not generate all binary strings and
filter afterward.

## 10. Basic greedy — `canReachEnd`

Each value is the maximum number of positions you may jump forward from that index.
Return whether the final index is reachable. An empty array and a one-element array are
considered reachable.

```ts
canReachEnd([2, 3, 1, 1, 4]); // true
canReachEnd([3, 2, 1, 0, 4]); // false
```

Target: `O(n)` time and `O(1)` extra space.

## Interview checklist

For every exercise, say these things aloud before coding:

1. What the inputs, output, and edge cases are.
2. What brute force would cost.
3. Which invariant the chosen pattern maintains.
4. The final time and space complexity.
