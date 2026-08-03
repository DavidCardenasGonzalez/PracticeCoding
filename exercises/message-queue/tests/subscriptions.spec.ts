import { describe, expect, it, vi } from 'vitest';

import { InvalidSubscribeOptionsError, TopicNotFoundError } from '../src/index.js';
import {
  createDeferred,
  flushMicrotasks,
  waitForCondition,
} from '../../../shared/test-utils/index.js';
import { createTestQueue } from './test-fixture.js';

describe('MessageQueue subscriptions and concurrency', () => {
  it('rejects subscriptions to an unknown topic', () => {
    const queue = createTestQueue();

    expect(() => queue.subscribe('missing', () => undefined)).toThrow(TopicNotFoundError);
  });

  it.each([
    { concurrency: 0 },
    { concurrency: 1.5 },
    { maxRetries: -1 },
    { maxRetries: 1.5 },
    { retryDelayMs: -1 },
    { retryDelayMs: Number.NaN },
    { retryDelayMs: Number.POSITIVE_INFINITY },
  ])('rejects invalid subscription options: %o', (options) => {
    const queue = createTestQueue();
    queue.createTopic('jobs');

    expect(() => queue.subscribe('jobs', () => undefined, options)).toThrow(
      InvalidSubscribeOptionsError,
    );
  });

  it('delivers a message to a synchronous handler', async () => {
    const queue = createTestQueue();
    const handler = vi.fn((_message, { ack }) => ack());
    queue.createTopic('jobs');
    queue.subscribe('jobs', handler);

    queue.publish('jobs', { jobId: 1 });
    await waitForCondition(() => handler.mock.calls.length === 1);

    expect(handler).toHaveBeenCalledOnce();
  });

  it('awaits an asynchronous handler', async () => {
    const queue = createTestQueue();
    const gate = createDeferred();
    let completed = false;
    queue.createTopic('jobs');
    queue.subscribe('jobs', async (_message, { ack }) => {
      await gate.promise;
      completed = true;
      ack();
    });
    queue.publish('jobs', 'job');
    await waitForCondition(() => queue.getQueueSize('jobs') === 0);

    expect(completed).toBe(false);
    gate.resolve();
    await waitForCondition(() => completed);
  });

  it('delivers messages that were queued before subscribing', async () => {
    const queue = createTestQueue();
    const payloads: number[] = [];
    queue.createTopic('jobs');
    queue.publish('jobs', 1);
    queue.publish('jobs', 2);

    queue.subscribe<number>('jobs', (message, { ack }) => {
      payloads.push(message.payload);
      ack();
    });
    await waitForCondition(() => payloads.length === 2);

    expect(payloads).toEqual([1, 2]);
  });

  it('starts dispatch asynchronously after a synchronous publication burst', async () => {
    const queue = createTestQueue();
    const handler = vi.fn((_message, { ack }) => ack());
    queue.createTopic('jobs');
    queue.subscribe('jobs', handler);

    queue.publish('jobs', 1);
    queue.publish('jobs', 2);

    expect(handler).not.toHaveBeenCalled();
    await waitForCondition(() => handler.mock.calls.length === 2);
  });

  it('allows another consumer to work while the first is at capacity', async () => {
    const queue = createTestQueue();
    const firstGate = createDeferred();
    const deliveries: string[] = [];
    queue.createTopic('jobs');
    queue.subscribe<string>('jobs', async (message, { ack }) => {
      deliveries.push(`first:${message.payload}`);
      await firstGate.promise;
      ack();
    });
    queue.publish('jobs', 'one');
    await waitForCondition(() => deliveries.length === 1);

    queue.subscribe<string>('jobs', (message, { ack }) => {
      deliveries.push(`second:${message.payload}`);
      ack();
    });
    queue.publish('jobs', 'two');
    await waitForCondition(() => deliveries.length === 2);

    expect(deliveries).toContain('second:two');
    firstGate.resolve();
  });

  it('respects the concurrency limit of a subscription', async () => {
    const queue = createTestQueue();
    const gates = Array.from({ length: 4 }, () => createDeferred());
    let active = 0;
    let maximumActive = 0;
    let started = 0;
    queue.createTopic('jobs');
    queue.subscribe<number>(
      'jobs',
      async (message, { ack }) => {
        active += 1;
        started += 1;
        maximumActive = Math.max(maximumActive, active);
        const gate = gates[message.payload];
        if (!gate) throw new Error('Missing gate');
        await gate.promise;
        active -= 1;
        ack();
      },
      { concurrency: 2 },
    );
    for (let index = 0; index < 4; index += 1) queue.publish('jobs', index);

    await waitForCondition(() => started === 2);
    expect(maximumActive).toBe(2);
    expect(queue.getQueueSize('jobs')).toBe(2);

    gates[0]?.resolve();
    gates[1]?.resolve();
    await waitForCondition(() => started === 4);
    expect(maximumActive).toBe(2);
    gates[2]?.resolve();
    gates[3]?.resolve();
  });

  it('never delivers the same message concurrently to two consumers', async () => {
    const queue = createTestQueue();
    const gate = createDeferred();
    const receivedIds: string[] = [];
    queue.createTopic('jobs');
    const handler = async (
      message: { id: string },
      { ack }: { ack(): void },
    ): Promise<void> => {
      receivedIds.push(message.id);
      await gate.promise;
      ack();
    };
    queue.subscribe('jobs', handler);
    queue.subscribe('jobs', handler);

    const id = queue.publish('jobs', 'only-once');
    await waitForCondition(() => receivedIds.length === 1);
    await flushMicrotasks();

    expect(receivedIds).toEqual([id]);
    gate.resolve();
  });

  it('stops delivering new messages after a subscription is cancelled', async () => {
    const queue = createTestQueue();
    const cancelledHandler = vi.fn((_message, { ack }) => ack());
    const activeHandler = vi.fn((_message, { ack }) => ack());
    queue.createTopic('jobs');
    const unsubscribe = queue.subscribe('jobs', cancelledHandler);
    unsubscribe();
    unsubscribe();
    queue.subscribe('jobs', activeHandler);

    queue.publish('jobs', 'job');
    await waitForCondition(() => activeHandler.mock.calls.length === 1);

    expect(cancelledHandler).not.toHaveBeenCalled();
  });

  it('does not abort an active handler when its subscription is cancelled', async () => {
    const queue = createTestQueue();
    const gate = createDeferred();
    let finished = false;
    queue.createTopic('jobs');
    const unsubscribe = queue.subscribe('jobs', async (_message, { ack }) => {
      await gate.promise;
      finished = true;
      ack();
    });
    queue.publish('jobs', 'job');
    await waitForCondition(() => queue.getQueueSize('jobs') === 0);

    unsubscribe();
    gate.resolve();
    await waitForCondition(() => finished);

    expect(finished).toBe(true);
  });
});
