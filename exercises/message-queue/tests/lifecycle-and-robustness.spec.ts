import { describe, expect, it, vi } from 'vitest';

import { QueueShutdownError, TopicNotEmptyError, type Message } from '../src/index.js';
import {
  createDeferred,
  flushMicrotasks,
  waitForCondition,
} from '../../../shared/test-utils/index.js';
import { createTestQueue } from './test-fixture.js';

describe('MessageQueue state reporting and lifecycle', () => {
  it('reports only ready and delayed messages as pending', async () => {
    const queue = createTestQueue();
    const gate = createDeferred();
    queue.createTopic('jobs');
    queue.publish('jobs', 'active');
    queue.publish('jobs', 'pending');
    expect(queue.getQueueSize('jobs')).toBe(2);

    queue.subscribe(
      'jobs',
      async (_message, { ack }) => {
        await gate.promise;
        ack();
      },
      { concurrency: 1 },
    );
    await waitForCondition(() => queue.getQueueSize('jobs') === 1);

    expect(queue.getQueueSize('jobs')).toBe(1);
    gate.resolve();
  });

  it('refuses to delete a topic while a message is in flight', async () => {
    const queue = createTestQueue();
    const gate = createDeferred();
    queue.createTopic('jobs');
    queue.subscribe('jobs', async (_message, { ack }) => {
      await gate.promise;
      ack();
    });
    queue.publish('jobs', 'active');
    await waitForCondition(() => queue.getQueueSize('jobs') === 0);

    expect(() => queue.deleteTopic('jobs')).toThrow(TopicNotEmptyError);
    gate.resolve();
  });

  it('waits for active work during graceful shutdown', async () => {
    const queue = createTestQueue();
    const gate = createDeferred();
    let handlerStarted = false;
    let shutdownResolved = false;
    queue.createTopic('jobs');
    queue.subscribe('jobs', async (_message, { ack }) => {
      handlerStarted = true;
      await gate.promise;
      ack();
    });
    queue.publish('jobs', 'active');
    await waitForCondition(() => handlerStarted);

    const shutdown = queue.shutdown().then(() => {
      shutdownResolved = true;
    });
    await flushMicrotasks();
    expect(shutdownResolved).toBe(false);

    gate.resolve();
    await shutdown;
    expect(shutdownResolved).toBe(true);
  });

  it('rejects publications and subscriptions after shutdown', async () => {
    const queue = createTestQueue();
    queue.createTopic('jobs');
    await queue.shutdown();

    expect(() => queue.publish('jobs', 'late')).toThrow(QueueShutdownError);
    expect(() => queue.subscribe('jobs', () => undefined)).toThrow(QueueShutdownError);
  });

  it('does not start queued work once shutdown has begun', async () => {
    const queue = createTestQueue();
    const handler = vi.fn((_message, { ack }) => ack());
    queue.createTopic('jobs');
    queue.subscribe('jobs', handler);
    queue.publish('jobs', 'queued');

    await queue.shutdown();
    await flushMicrotasks();

    expect(handler).not.toHaveBeenCalled();
    expect(queue.getQueueSize('jobs')).toBe(1);
  });

  it('allows shutdown to be called repeatedly while closing and after closing', async () => {
    const queue = createTestQueue();
    const gate = createDeferred();
    queue.createTopic('jobs');
    queue.subscribe('jobs', async (_message, { ack }) => {
      await gate.promise;
      ack();
    });
    queue.publish('jobs', 'active');
    await waitForCondition(() => queue.getQueueSize('jobs') === 0);

    const first = queue.shutdown();
    const second = queue.shutdown();
    gate.resolve();

    await expect(Promise.all([first, second])).resolves.toEqual([undefined, undefined]);
    await expect(queue.shutdown()).resolves.toBeUndefined();
  });

  it('cancels retry timers during shutdown and keeps those messages pending', async () => {
    vi.useFakeTimers();
    const queue = createTestQueue();
    queue.createTopic('jobs');
    queue.subscribe('jobs', (_message, { nack }) => nack(), {
      maxRetries: 1,
      retryDelayMs: 10_000,
    });
    queue.publish('jobs', 'delayed');
    await flushMicrotasks();
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    await queue.shutdown();

    expect(vi.getTimerCount()).toBe(0);
    expect(queue.getQueueSize('jobs')).toBe(1);
  });
});

describe('MessageQueue robustness under failures and load', () => {
  it('handles rejected handlers without emitting unhandledRejection', async () => {
    const queue = createTestQueue();
    const unhandled: unknown[] = [];
    const listener = (reason: unknown): void => {
      unhandled.push(reason);
    };
    process.on('unhandledRejection', listener);

    try {
      queue.createTopic('jobs');
      queue.subscribe(
        'jobs',
        async () => {
          throw new Error('expected handler failure');
        },
        { maxRetries: 0 },
      );
      queue.publish('jobs', 'job');
      await waitForCondition(() => queue.getDeadLetterMessages('jobs').length === 1);
      await new Promise<void>((resolve) => setImmediate(resolve));

      expect(unhandled).toEqual([]);
    } finally {
      process.off('unhandledRejection', listener);
    }
  });

  it('processes a rapid concurrent publication burst without loss or duplication', async () => {
    const queue = createTestQueue();
    const received: Message<number>[] = [];
    queue.createTopic('jobs');
    for (let consumer = 0; consumer < 4; consumer += 1) {
      queue.subscribe<number>(
        'jobs',
        async (message, { ack }) => {
          await Promise.resolve();
          received.push(message);
          ack();
        },
        { concurrency: 4 },
      );
    }

    const publishedIds = await Promise.all(
      Array.from({ length: 300 }, async (_, payload) => {
        await Promise.resolve();
        return queue.publish('jobs', payload);
      }),
    );
    await waitForCondition(() => received.length === publishedIds.length, {
      timeoutMs: 800,
    });

    const receivedIds = received.map(({ id }) => id);
    expect(receivedIds).toHaveLength(publishedIds.length);
    expect(new Set(receivedIds).size).toBe(receivedIds.length);
    expect(new Set(receivedIds)).toEqual(new Set(publishedIds));
    expect(queue.getQueueSize('jobs')).toBe(0);
  });
});
