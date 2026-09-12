export type Interval = readonly [start: number, end: number];
export type RangeQuery = readonly [start: number, end: number];
export type GridCell = '0' | '1';

/** Return whether equal values occur no farther apart than maxDistance. */
export function hasNearbyDuplicate(
  _items: ReadonlyArray<number>,
  _maxDistance: number,
): boolean {
  const locationMap = new Map();
  for (let i = 0; i < _items.length; i++) {
    const item = _items[i];
    if (locationMap.has(item)) {
      if (Math.abs(locationMap.get(item) - i) <= _maxDistance) {
        return true;
      }
    } else {
      locationMap.set(item, i);
    }
  }
  return false;
}

/** Return the input values squared and sorted, without sorting the result. */
export function sortedSquares(_items: ReadonlyArray<number>): number[] {
  let start = 0;
  let end = _items.length - 1;
  const newArray = [..._items];
  let indexToAsign = end;
  while (start <= end) {
    if (Math.pow(_items[start]!, 2) > Math.pow(_items[end]!, 2)) {
      newArray[indexToAsign] = Math.pow(_items[start]!, 2);
      start++;
    } else {
      newArray[indexToAsign] = Math.pow(_items[end]!, 2);
      end--;
    }
    indexToAsign--;
  }
  return newArray;
}

/** Return the longest contiguous section containing at most two distinct values. */
export function longestSubarrayWithTwoValues(_items: ReadonlyArray<number>): number {
  let start = 0;
  const itemsSet = new Set();
  let longest = 0;
  for(let end = 0; end < _items.length; end++){
    while(itemsSet.has(_items[end])){
      itemsSet.delete(_items[start]);
      start++;
    }
    itemsSet.add(_items[end])
    longest = Math.max(longest, Math.abs(end - start));
  }
  return longest;
}

/** Apply each star as a backspace for the closest remaining character. */
export function removeStars(_text: string): string {
  throw new Error('Not implemented');
}

/** Find the first target index in a sorted array, or -1 when it is absent. */
export function firstOccurrence(_items: ReadonlyArray<number>, _target: number): number {
  throw new Error('Not implemented');
}

/** Insert and merge an interval into sorted non-overlapping intervals. */
export function insertInterval(
  _intervals: ReadonlyArray<Interval>,
  _newInterval: Interval,
): Array<[number, number]> {
  throw new Error('Not implemented');
}

/** Answer inclusive range-sum queries using one preprocessing pass. */
export function rangeSumQueries(
  _items: ReadonlyArray<number>,
  _queries: ReadonlyArray<RangeQuery>,
): number[] {
  throw new Error('Not implemented');
}

/** Count horizontally or vertically connected groups without mutating the grid. */
export function countIslands(_grid: ReadonlyArray<ReadonlyArray<GridCell>>): number {
  throw new Error('Not implemented');
}

/** Generate valid parentheses using opening branches before closing branches. */
export function generateParentheses(_pairs: number): string[] {
  throw new Error('Not implemented');
}

/** Return whether greedy forward reach can include the final index. */
export function canReachEnd(_jumps: ReadonlyArray<number>): boolean {
  throw new Error('Not implemented');
}
