/** Reverse the provided array without allocating another proportional-size array. */
export function reverseInPlace(_items: number[]): void {
  for(let i = 0; i < _items.length / 2; i++){
    const pointer2 = _items.length - 1 - i;
    const lastItem = _items[pointer2];
    _items[pointer2] = _items[i] as number;
    _items[i] = lastItem as number;
  }
}

/** Check for an ASCII alphanumeric palindrome while ignoring case and punctuation. */
export function isPalindrome(_text: string): boolean {
  const cleanString = _text.toLowerCase()
  .split('')
  .filter(lt => lt >= 'a' && lt <= 'z' ||  lt >= '0' && lt <= '9');

  for(let i = 0; i<cleanString.length / 2; i++){
    const lastIndex = cleanString.length - 1 - i;
    if(cleanString[i] !== cleanString[lastIndex]){
      return false;
    }
  }
  return true;
}

/** Find the indexes of the pair in a sorted array whose sum equals the target. */
export function pairWithTargetSum(
  _items: ReadonlyArray<number>,
  _target: number,
): [number, number] | null {
  const numberMap = new Map();
  for(let i = 0; i < _items.length; i++){
    const missingTarget = _target - (_items[i] ?? 0);
    if(numberMap.has(missingTarget)){
      return [numberMap.get(missingTarget), i];
    }else{
      numberMap.set(_items[i], i)
    }
  }
  return null;
}

/** Compact a sorted array in place and return the length of its unique prefix. */
export function removeDuplicates(_items: number[]): number {
  if(_items.length === 0){
    return 0
  }
  let uniqueIndex = 0;
  for(let i = 1; i < _items.length; i++){
    if(_items[i-1] !== _items[i]){
      uniqueIndex++;
      _items[uniqueIndex] = _items[i] as number;
    }
  }
  return uniqueIndex + 1;
}

/** Return the greatest water-container area formed by two heights. */
export function maxContainerArea(_heights: ReadonlyArray<number>): number {
  let maxArea = 0;
  let left = 0;
  let right = _heights.length - 1;
  while(left < right){
    const currenteArea = (right - left) * Math.min(_heights[left]!, _heights[right]!);
    if(currenteArea > maxArea){
      maxArea = currenteArea;
    }
    if((right - left )=== 1){
      left++;
      right = _heights.length - 1;
    }else{
      right--;
    }
  }

  return maxArea;
}
