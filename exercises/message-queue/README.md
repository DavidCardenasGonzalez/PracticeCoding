# In-memory Message Queue

Implement `MessageQueue`, an in-memory message queue with topics, competing
consumers, priorities, limited concurrency, retries, and a Dead Letter Queue (DLQ).
The goal is not to mimic a particular product, but to reason about asynchronous
state, message ownership, race conditions, and graceful shutdown without external
services.

The `src` files contain the compilable contract, but their methods are stubs. The
tests are the executable specification and must pass without modification.

## Public API

```ts
interface Message<T = unknown> {
  readonly id: string;
  readonly topic: string;
  readonly payload: T;
  readonly priority: number;
  readonly attempts: number;
  readonly createdAt: Date;
}

interface PublishOptions {
  priority?: number;
}

interface SubscribeOptions {
  concurrency?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

type MessageHandler<T = unknown> = (
  message: Message<T>,
  context: { ack(): void; nack(error?: Error): void },
) => void | Promise<void>;

class MessageQueue {
  createTopic(topic: string): void;
  deleteTopic(topic: string): void;
  publish<T>(topic: string, payload: T, options?: PublishOptions): string;
  subscribe<T>(
    topic: string,
    handler: MessageHandler<T>,
    options?: SubscribeOptions,
  ): () => void;
  getQueueSize(topic: string): number;
  getDeadLetterMessages(topic: string): ReadonlyArray<Message>;
  shutdown(): Promise<void>;
}
```

The types and errors exported by `src/index.ts` are part of the public API.

## Functional rules

### Topics and publishing

- A name is 1–64 characters long and matches `^[a-z0-9]+(?:[._-][a-z0-9]+)*$`:
  lowercase ASCII letters, digits, and single separators (`.`, `_`, `-`) that are
  neither consecutive nor placed at either end.
- Creating an existing topic throws `TopicAlreadyExistsError`. Any operation requiring
  an existing topic throws `TopicNotFoundError` when it is missing.
- A topic may be deleted only when it has no pending or in-flight messages. Otherwise,
  it throws `TopicNotEmptyError` and remains unchanged. Deleting it cancels its
  subscriptions; reusing the name creates a new topic.
- `priority` is an integer from 0 to 10 inclusive; it defaults to 0. Invalid options
  throw `InvalidPublishOptionsError`.
- Every publication returns a non-empty ID that is unique within the queue instance.
  `createdAt` represents publication time and payload identity is preserved.
- Eligible messages with higher priority are delivered first. Messages with the same
  priority retain FIFO ordering. Dispatch must begin in an asynchronous task so a
  synchronous burst can be ordered before consumption starts.

### Subscriptions and concurrency

- `concurrency` is an integer greater than or equal to 1 (default: 1), `maxRetries`
  is an integer greater than or equal to 0 (default: 3), and `retryDelayMs` is a
  finite number greater than or equal to 0 (default: 0). Invalid values throw
  `InvalidSubscribeOptionsError`.
- Topic subscriptions are competing consumers, not pub/sub: each message is assigned
  to exactly one subscription and never to two at the same time.
- The concurrency limit is per subscription. A saturated subscription does not stop
  another subscription with capacity from receiving work. No particular allocation
  algorithm or starvation guarantee is required.
- The function returned by `subscribe` cancels its subscription idempotently. Active
  handlers may finish, but the subscription receives no new deliveries.

### ACK, NACK, and retries

- A message remains in flight until `ack()` or `nack()` settles it.
- `ack()` confirms and removes the message. `nack(error)` marks the attempt as failed.
- A handler that throws or returns a rejected promise is equivalent to `nack(error)`.
- A handler that completes successfully without calling either method is equivalent to
  `nack()`; ACK is deliberately explicit.
- The first terminal signal wins. Later `ack`/`nack` calls, or an exception after an
  ACK, neither change the outcome nor throw.
- `attempts` starts at 0 and increases once for each failed delivery. `maxRetries`
  denotes **additional** retries: a value of 2 permits at most three deliveries and a
  message enters the DLQ with `attempts === 3` when all deliveries fail.
- A retry becomes eligible only after `retryDelayMs`. While waiting, it preserves its
  ID, topic, payload, priority, and `createdAt`; it counts as pending in
  `getQueueSize` and does not block other messages.

### DLQ, state, and shutdown

- The DLQ is independent for each topic, preserves insertion order, and is not
  consumed automatically. `getDeadLetterMessages` returns a snapshot: changing the
  returned array cannot mutate queue state.
- `getQueueSize` counts ready messages and messages waiting for a retry; it excludes
  in-flight messages and DLQ messages.
- `shutdown()` immediately prevents new publications, subscriptions, and deliveries,
  and waits for currently active handlers. Later publications throw `QueueShutdownError`.
- Retry timers are cancelled during shutdown; their messages remain pending but are no
  longer delivered. Size and DLQ queries remain available.
- Calling `shutdown()` multiple times is safe and waits for the same shutdown process.
  No timers, listeners, or unhandled promise rejections may remain.

## Important edge cases

- Publications made before subscribing are retained.
- A NACK cannot result in two copies of the same message being delivered simultaneously.
- A delayed retry does not block later messages.
- Consecutive ACK and NACK calls, cancellation during a handler, and shutdown during
  active work must be safe.
- A rapid message load and several consumers cannot lose or duplicate IDs.

## Minimal example

```ts
import { MessageQueue } from './src/index.js';

const queue = new MessageQueue();
queue.createTopic('email.transactional');

const unsubscribe = queue.subscribe<{ to: string }>(
  'email.transactional',
  async (message, { ack, nack }) => {
    try {
      await sendEmail(message.payload.to);
      ack();
    } catch (error) {
      nack(error instanceof Error ? error : new Error('Unknown error'));
    }
  },
  { concurrency: 4, maxRetries: 2, retryDelayMs: 100 },
);

queue.publish('email.transactional', { to: 'dev@example.com' }, { priority: 5 });

unsubscribe();
await queue.shutdown();
```

## Constraints and evaluation criteria

- Everything runs in memory and in a single Node.js process.
- Do not add brokers, databases, web frameworks, or runtime dependencies.
- You may create internal modules, but keep the public API unchanged and do not modify
  tests to accommodate the solution.
- Evaluation covers observable correctness, no lost or duplicated deliveries,
  concurrency control, race-condition handling, released timers, error handling,
  readability, and separation of responsibilities.
- Persistence, cross-process delivery, global ordering across topics, forced handler
  cancellation, and distributed exactly-once guarantees are out of scope.
