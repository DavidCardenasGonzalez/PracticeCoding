/** Return whether all brackets are correctly paired and nested. */
export function hasBalancedBrackets(_text: string): boolean {
  const stack: string[] = [];
  const closersMap = new Map([
    ['(', ')'],
    ['[', ']'],
    ['{', '}'],
  ]);
  for (const char of _text) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    } else {
      const lastCharacter = stack[stack.length - 1];
      if (closersMap.get(lastCharacter || '') !== char) {
        return false;
      } else {
        stack.pop();
      }
    }
  }
  return stack.length === 0;
}

/** Evaluate a valid Reverse Polish Notation expression. */
export function evaluatePostfix(_tokens: ReadonlyArray<string>): number {
  let numbersStack: number[] = [];
  for (const char of _tokens) {
    if (char === '+') {
      const newNumber = numbersStack.reduce((acc, element) => acc + element, 0);
      numbersStack = [newNumber];
    } else if (char === '-') {
      const newNumber =
        (numbersStack[numbersStack.length - 2] ?? 0) -
        (numbersStack[numbersStack.length - 1] ?? 0);
      numbersStack.splice(numbersStack.length - 2, 2);
      numbersStack.push(newNumber);
    } else if (char === '*') {
      const newNumber = numbersStack.reduce((acc, element) => acc * element, 1);
      numbersStack = [newNumber];
    } else if (char === '/') {
      const newNumber =
        (numbersStack[numbersStack.length - 2] ?? 0) /
        (numbersStack[numbersStack.length - 1] ?? 0);
      numbersStack.splice(numbersStack.length - 2, 2);
      numbersStack.push((newNumber > 0 ? Math.floor(newNumber): Math.ceil(newNumber)));
    } else {
      numbersStack.push(Number(char));
    }
  }
  return numbersStack.length > 0 ? numbersStack[0]! : 0;
}

/** Return the first strictly greater value to the right of each input value. */
export function nextGreaterValues(_items: ReadonlyArray<number>): number[] {
  throw new Error('Not implemented');
}

/** Generic FIFO queue backed by indexed array access. */
export class ArrayQueue<T> {
  enqueue(_value: T): void {
    throw new Error('Not implemented');
  }

  dequeue(): T | undefined {
    throw new Error('Not implemented');
  }

  peek(): T | undefined {
    throw new Error('Not implemented');
  }

  get size(): number {
    throw new Error('Not implemented');
  }

  get isEmpty(): boolean {
    throw new Error('Not implemented');
  }
}

/** Report the first unique character after each character in the input stream. */
export function firstUniqueAfterEachCharacter(_text: string): Array<string | null> {
  throw new Error('Not implemented');
}
