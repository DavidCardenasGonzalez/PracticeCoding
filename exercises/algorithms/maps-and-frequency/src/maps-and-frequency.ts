/** Count values while preserving the insertion order of their first occurrence. */
export function countFrequencies<T>(_items: ReadonlyArray<T>): Map<T, number> {
  const frecuencyMap = new Map();
  for (const item of _items) {
    frecuencyMap.set(item, (frecuencyMap.get(item) ?? 0) + 1);
  }
  return frecuencyMap;
}

/** Return the first value with frequency one, or null when it does not exist. */
export function firstUniqueValue(_items: ReadonlyArray<number>): number | null {
  const frequencies = new Map<number, number>();

  for (const item of _items) {
    frequencies.set(item, (frequencies.get(item) ?? 0) + 1);
  }

  for (const item of _items) {
    if (frequencies.get(item) === 1) {
      return item;
    }
  }

  return null;
}

/** Check whether target can consume characters from source without reusing them. */
export function canConstruct(_target: string, _source: string): boolean {
  const frecuencySourceMap = new Map();
  for(const letter of _source.split('')){
    frecuencySourceMap.set(letter, (frecuencySourceMap.get(letter) ?? 0) + 1)
  }
  for(const letter of _target.split('')){
    if(!frecuencySourceMap.get(letter)){
      return false;
    }
    frecuencySourceMap.set(letter, frecuencySourceMap.get(letter) - 1)
  }
  return true;
}

/** Group lowercase English words by their character frequencies. */
export function groupAnagrams(_words: ReadonlyArray<string>): string[][] {
  const frecuencyMap = new Map();
  for(const word of _words){
    const key = word.split('').sort().join('');
    const currentValue = frecuencyMap.get(key) || [];
    frecuencyMap.set(key, [...currentValue, word]);
  }
   return Array.from(frecuencyMap.values());
}

/** Rank distinct values by descending frequency, breaking ties by first appearance. */
export function topKFrequent(_items: ReadonlyArray<number>, _k: number): number[] {
    const frequencies = new Map<number, number>();

  for (const item of _items) {
    frequencies.set(item, (frequencies.get(item) ?? 0) + 1);
  }

  return [...frequencies.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, _k)
    .map(([number]) => number);
}
