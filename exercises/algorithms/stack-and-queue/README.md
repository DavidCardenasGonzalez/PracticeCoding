# Stack and Queue

Stacks process the most recently added item first (LIFO); queues process the oldest
item first (FIFO). These exercises cover direct use, monotonic stacks, and implementing
a queue without repeated array shifts.

Run this topic with:

```bash
npm run test:algorithms:stack-and-queue
```

## 1. `hasBalancedBrackets`

Return whether every bracket in the string is correctly paired and nested. The only
possible characters are `(`, `)`, `[`, `]`, `{`, and `}`. An empty string is balanced.

```ts
hasBalancedBrackets('([]{})'); // true
hasBalancedBrackets('([)]'); // false
```

Target: `O(n)` time and `O(n)` extra space in the worst case.

## 2. `evaluatePostfix`

Evaluate an arithmetic expression written in Reverse Polish Notation. Tokens contain
integers or the operators `+`, `-`, `*`, and `/`. Division truncates toward zero. Every
input is a valid expression and every result fits in a JavaScript safe integer.

```ts
evaluatePostfix(['2', '1', '+', '3', '*']); // 9
evaluatePostfix(['7', '3', '/']); // 2
```

Operand order matters: `['5', '2', '-']` means `5 - 2`, not `2 - 5`.

Target: `O(n)` time and `O(n)` extra space.

## 3. `nextGreaterValues`

For each number, return the first strictly greater value found to its right. Use `-1`
when no greater value exists.

```ts
nextGreaterValues([2, 1, 2, 4, 3]); // [4, 2, 4, -1, -1]
```

Target: `O(n)` time and `O(n)` extra space. A monotonic stack prevents scanning the
remainder of the array for every element.

## 4. `ArrayQueue`

Implement the provided generic FIFO queue. `dequeue` and `peek` return `undefined` when
the queue is empty.

```ts
const queue = new ArrayQueue<number>();
queue.enqueue(10);
queue.enqueue(20);
queue.dequeue(); // 10
queue.peek(); // 20
queue.size; // 1
```

Every operation should be `O(1)` amortized. Avoid calling `Array.prototype.shift()`,
which moves all remaining elements. It is acceptable to compact internal storage
occasionally so removed entries do not remain forever.

## 5. `firstUniqueAfterEachCharacter`

Process a string from left to right. After every character, record the earliest
character seen so far whose frequency is exactly one. Record `null` if none exists.

```ts
firstUniqueAfterEachCharacter('aabc');
// ['a', null, 'b', 'b']
```

Target: `O(n)` time and `O(u)` extra space. Combine a frequency map with a queue of
possible answers.

## Rules

- Do not change exported APIs.
- Do not edit tests to accommodate an implementation.
- Do not mutate input arrays.
- Empty arrays and strings are valid inputs.
