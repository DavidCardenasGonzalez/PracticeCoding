/** Return the greatest sum among contiguous windows of the requested size. */
export function maxFixedWindowSum(
  _items: ReadonlyArray<number>,
  _windowSize: number,
): number {
  let maxSum = 0;
  for (let i = 0; i < _windowSize; i++) {
    maxSum = maxSum + (_items[i] ?? 0);
  }

  let currentSum = maxSum;
  for (let i = 1; i < _items.length - _windowSize + 1; i++) {
    currentSum = currentSum - (_items[i - 1] ?? 0) + (_items[i + _windowSize - 1] ?? 0);
    maxSum = Math.max(currentSum, maxSum);
  }
  return maxSum;
}

/** Return the maximum length of a substring without repeated characters. */
export function longestUniqueSubstringLength(_text: string): number {
  const currentSet = new Set();
  let start = 0;
  let end = 0;
  let maxSubring = '';
  while (end < _text.length) {
    if (!currentSet.has(_text[end])) {
      currentSet.add(_text[end]);
      const current = _text.substring(start, end + 1);
      maxSubring = maxSubring.length > current.length ? maxSubring : current;
      end++;
    } else {
      currentSet.delete(_text[start]);
      start++;
    }
  }
  return maxSubring.length;
}

/** Return the shortest positive-number subarray whose sum reaches the target. */
export function minSubarrayLength(
  _target: number,
  _items: ReadonlyArray<number>,
): number {
  let start = 0;
  let end = 0;
  let currentSum = 0;

  while (currentSum < _target && _items[end]) {
    currentSum = currentSum + _items[end]!;
    end++;
  }
  if (currentSum < _target) {
    return 0;
  }
  let valuatedSum = currentSum;
  let currentMin = end;

  while (end < _items.length - 1 || start < _items.length - 1) {
    if (valuatedSum < _target) {
      valuatedSum = valuatedSum + _items[end]!;
      end++;
    } else {
      if (currentMin >= end - start) {
        currentMin = end - start;
      }
      valuatedSum = valuatedSum - _items[start]!;
      start++;
    }
  }
  return currentMin;
}

/** Return all starts of windows whose lowercase-letter frequencies match pattern. */
export function findAnagramStartIndices(_text: string, _pattern: string): number[] {
  const indexes = [];
  const sortedPattern = _pattern.split('').sort().join('');
  for (let i = 0; i < _text.length; i++) {
    const subt = _text
      .substring(i, i + _pattern.length)
      .split('')
      .sort()
      .join('');
    if (sortedPattern === subt) {
      indexes.push(i);
    }
  }
  return indexes;
}

/** Return the longest binary window containing at most maxFlips zeroes. */
export function longestOnesAfterFlips(
  _items: ReadonlyArray<0 | 1>,
  _maxFlips: number,
): number {
  let currentMaxLength = 0;
  let currentEnd = 0;
  let currentFlips = 0;

  for (let start = 0; start < _items.length; start++) {

    if (_items[start - 1] === 0) {
      currentFlips--;
    }
    currentEnd = Math.max(currentEnd, start);
    while (
      (currentFlips < _maxFlips || _items[currentEnd] === 1) &&
      currentEnd < _items.length
    ) {
      if (_items[currentEnd] === 0) {
        currentFlips++;
      }
      currentEnd++;
    }
    currentMaxLength = Math.max(currentMaxLength, currentEnd - start);
  }
  return currentMaxLength;
}
