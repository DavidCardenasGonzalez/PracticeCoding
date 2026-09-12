# Maps and Frequency Maps

Practice recognizing when a `Map` can replace repeated searches or comparisons. The
problems are ordered from direct counting to combining counting with grouping and
selection.

Run this topic with:

```bash
npm run test:algorithms:maps
```

## 1. `countFrequencies`

Return a `Map` whose keys are the values in `items` and whose values are their number of
occurrences. Keys must appear in the map in the order in which they first occur.

```ts
countFrequencies(['red', 'blue', 'red']);
// Map { 'red' => 2, 'blue' => 1 }
```

Target: `O(n)` time and `O(u)` extra space, where `u` is the number of distinct values.

## 2. `firstUniqueValue`

Return the first number that occurs exactly once. Return `null` when no such value
exists.

```ts
firstUniqueValue([4, 5, 4, 6, 5]); // 6
firstUniqueValue([2, 2]); // null
```

Target: `O(n)` time and `O(u)` extra space. Preserve input order; the smallest unique
number is not necessarily the answer.

## 3. `canConstruct`

Determine whether `target` can be assembled from the characters in `source`. Each
source character may be consumed at most once. Comparisons are case-sensitive and
spaces and punctuation are ordinary characters.

```ts
canConstruct('hello', 'oleh world'); // true
canConstruct('hello', 'helo'); // false
```

Target: `O(s + t)` time and `O(u)` extra space.

## 4. `groupAnagrams`

Group words that are anagrams. Inputs contain only lowercase English letters. Preserve
the order of the groups by their first word and preserve the original order inside each
group.

```ts
groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']);
// [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
```

Target: `O(n * k)` time and `O(n * k)` extra space, where `k` is the maximum word
length. A fixed-size frequency signature avoids sorting every word.

## 5. `topKFrequent`

Return the `k` most frequent numbers. A higher frequency wins; ties are resolved by the number that appeared first in the input. The returned values must follow that same
ranking. `k` is always an integer from `1` through the number of distinct values.

```ts
topKFrequent([4, 4, 2, 2, 3], 2); // [4, 2]
```

Initial target: `O(n + u log u)` time and `O(u)` extra space. After solving it, consider
how buckets could reduce the time to `O(n)`.

## Rules

- Do not mutate input arrays.
- Do not change exported function signatures.
- Do not edit the tests to accommodate an implementation.
- Empty input is valid for every function whose contract permits it.
