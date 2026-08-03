import { describe, expect, it, vi } from 'vitest';

import type { Message } from '../src/index.js';
import { flushMicrotasks, waitForCondition } from '../../../shared/test-utils/index.js';
import { createTestQueue } from './test-fixture.js';

describe('MessageQueue retries', () => {
  it('increments attempts after every failed delivery', async () => {
    const queue = createTestQueue();
    const attempts: number[] = [];
    queue.createTopic('jobs');
    queue.subscribe(
      'jobs',
      (message, { nack }) => {
        attempts.push(message.attempts);
        nack();
      },
      { maxRetries: 2 },
    );

    queue.publish('jobs', 'job');
    await waitForCondition(() => queue.getDeadLetterMessages('jobs').length === 1);

    expect(attempts).toEqual([0, 1, 2]);
    expect(queue.getDeadLetterMessages('jobs')[0]?.attempts).toBe(3);
  });

  it('interprets maxRetries as additional attempts', async () => {
    const queue = createTestQueue();
    let deliveries = 0;
    queue.createTopic('jobs');
    queue.subscribe(
      'jobs',
      (_message, { nack }) => {
        deliveries += 1;
        nack();
      },
      { maxRetries: 0 },
    );

    queue.publish('jobs', 'job');
    await waitForCondition(() => queue.getDeadLetterMessages('jobs').length === 1);

    expect(deliveries).toBe(1);
  });

  it('waits the configured delay before making a retry eligible', async () => {
    vi.useFakeTimers();
    const queue = createTestQueue();
    const attempts: number[] = [];
    queue.createTopic('jobs');
    queue.subscribe(
      'jobs',
      (message, { ack, nack }) => {
        attempts.push(message.attempts);
        if (attempts.length === 1) nack();
        else ack();
      },
      { maxRetries: 1, retryDelayMs: 100 },
    );
    queue.publish('jobs', 'job');
    await flushMicrotasks();

    expect(attempts).toEqual([0]);
    await vi.advanceTimersByTimeAsync(99);
    expect(attempts).toEqual([0]);
    await vi.advanceTimersByTimeAsync(1);
    await flushMicrotasks();
    expect(attempts).toEqual([0, 1]);
  });

  it('does not block other messages while a retry is delayed', async () => {
    const queue = createTestQueue();
    const received: string[] = [];
    queue.createTopic('jobs');
    queue.subscribe<string>(
      'jobs',
      (message, { ack, nack }) => {
        received.push(`${message.payload}:${message.attempts}`);
        if (message.payload === 'retry' && message.attempts === 0) nack();
        else ack();
      },
      { maxRetries: 1, retryDelayMs: 40 },
    );

    queue.publish('jobs', 'retry');
    queue.publish('jobs', 'ready');
    await waitForCondition(() => received.includes('ready:0'));

    expect(received.slice(0, 2)).toEqual(['retry:0', 'ready:0']);
    await waitForCondition(() => received.includes('retry:1'));
  });

  it('counts delayed retries as pending rather than in flight', async () => {
    const queue = createTestQueue();
    let failed = false;
    queue.createTopic('jobs');
    queue.subscribe(
      'jobs',
      (_message, { nack }) => {
        failed = true;
        nack();
      },
      { maxRetries: 1, retryDelayMs: 100 },
    );

    queue.publish('jobs', 'job');
    await waitForCondition(() => failed);

    expect(queue.getQueueSize('jobs')).toBe(1);
  });
});

describe('MessageQueue Dead Letter Queue', () => {
  it('moves a message to DLQ after retries are exhausted', async () => {
    const queue = createTestQueue();
    queue.createTopic('jobs');
    queue.subscribe('jobs', (_message, { nack }) => nack(), { maxRetries: 1 });

    queue.publish('jobs', 'job');
    await waitForCondition(() => queue.getDeadLetterMessages('jobs').length === 1);

    expect(queue.getQueueSize('jobs')).toBe(0);
    expect(queue.getDeadLetterMessages('jobs')).toHaveLength(1);
  });

  it('preserves ID, payload, metadata and final attempt count in DLQ', async () => {
    const queue = createTestQueue();
    const payload = { jobId: 'abc' };
    queue.createTopic('jobs');
    queue.subscribe('jobs', (_message, { nack }) => nack(), { maxRetries: 2 });
    const id = queue.publish('jobs', payload, { priority: 8 });

    await waitForCondition(() => queue.getDeadLetterMessages('jobs').length === 1);
    const dead = queue.getDeadLetterMessages('jobs')[0] as Message<typeof payload>;

    expect(dead).toMatchObject({ id, topic: 'jobs', payload, priority: 8, attempts: 3 });
    expect(dead.createdAt).toBeInstanceOf(Date);
  });

  it('keeps each topic DLQ isolated', async () => {
    const queue = createTestQueue();
    queue.createTopic('jobs.one');
    queue.createTopic('jobs.two');
    queue.subscribe('jobs.one', (_message, { nack }) => nack(), { maxRetries: 0 });
    queue.publish('jobs.one', 'dead-one');

    await waitForCondition(() => queue.getDeadLetterMessages('jobs.one').length === 1);

    expect(queue.getDeadLetterMessages('jobs.one')[0]?.payload).toBe('dead-one');
    expect(queue.getDeadLetterMessages('jobs.two')).toEqual([]);
  });

  it('returns a snapshot that cannot mutate the internal DLQ', async () => {
    const queue = createTestQueue();
    queue.createTopic('jobs');
    queue.subscribe('jobs', (_message, { nack }) => nack(), { maxRetries: 0 });
    queue.publish('jobs', 'dead');
    await waitForCondition(() => queue.getDeadLetterMessages('jobs').length === 1);

    const snapshot = queue.getDeadLetterMessages('jobs');
    const mutableSnapshot = snapshot as Message[];
    mutableSnapshot.length = 0;

    expect(queue.getDeadLetterMessages('jobs')).toHaveLength(1);
  });

  it('never delivers DLQ messages automatically to later subscribers', async () => {
    const queue = createTestQueue();
    const nextHandler = vi.fn((_message, { ack }) => ack());
    queue.createTopic('jobs');
    const unsubscribe = queue.subscribe('jobs', (_message, { nack }) => nack(), {
      maxRetries: 0,
    });
    queue.publish('jobs', 'dead');
    await waitForCondition(() => queue.getDeadLetterMessages('jobs').length === 1);
    unsubscribe();

    queue.subscribe('jobs', nextHandler);
    await flushMicrotasks();

    expect(nextHandler).not.toHaveBeenCalled();
    expect(queue.getDeadLetterMessages('jobs')).toHaveLength(1);
  });
});
