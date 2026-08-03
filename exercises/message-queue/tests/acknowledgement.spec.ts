import { describe, expect, it, vi } from 'vitest';

import type { Message } from '../src/index.js';
import { flushMicrotasks, waitForCondition } from '../../../shared/test-utils/index.js';
import { createTestQueue } from './test-fixture.js';

describe('MessageQueue ACK and NACK semantics', () => {
  it('removes a message after ACK', async () => {
    const queue = createTestQueue();
    const handler = vi.fn((_message, { ack }) => ack());
    queue.createTopic('jobs');
    queue.subscribe('jobs', handler);

    queue.publish('jobs', 'job');
    await waitForCondition(() => handler.mock.calls.length === 1);
    await flushMicrotasks();

    expect(queue.getQueueSize('jobs')).toBe(0);
    expect(queue.getDeadLetterMessages('jobs')).toEqual([]);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('requeues the same message after NACK', async () => {
    const queue = createTestQueue();
    const received: Message<string>[] = [];
    queue.createTopic('jobs');
    queue.subscribe<string>('jobs', (message, { ack, nack }) => {
      received.push(message);
      if (received.length === 1) nack(new Error('temporary'));
      else ack();
    });

    const id = queue.publish('jobs', 'job');
    await waitForCondition(() => received.length === 2);

    expect(received.map((message) => message.id)).toEqual([id, id]);
    expect(received.map((message) => message.attempts)).toEqual([0, 1]);
  });

  it('treats a synchronous handler exception as NACK', async () => {
    const queue = createTestQueue();
    const attempts: number[] = [];
    queue.createTopic('jobs');
    queue.subscribe(
      'jobs',
      (message, { ack }) => {
        attempts.push(message.attempts);
        if (attempts.length === 1) throw new Error('boom');
        ack();
      },
      { maxRetries: 1 },
    );

    queue.publish('jobs', 'job');
    await waitForCondition(() => attempts.length === 2);

    expect(attempts).toEqual([0, 1]);
  });

  it('treats an asynchronous handler rejection as NACK', async () => {
    const queue = createTestQueue();
    let deliveries = 0;
    queue.createTopic('jobs');
    queue.subscribe(
      'jobs',
      async (_message, { ack }) => {
        deliveries += 1;
        await Promise.resolve();
        if (deliveries === 1) throw new Error('async boom');
        ack();
      },
      { maxRetries: 1 },
    );

    queue.publish('jobs', 'job');
    await waitForCondition(() => deliveries === 2);

    expect(deliveries).toBe(2);
  });

  it('treats a handler that finishes without settling as NACK', async () => {
    const queue = createTestQueue();
    queue.createTopic('jobs');
    queue.subscribe('jobs', () => undefined, { maxRetries: 0 });

    queue.publish('jobs', 'job');
    await waitForCondition(() => queue.getDeadLetterMessages('jobs').length === 1);

    expect(queue.getDeadLetterMessages('jobs')[0]?.attempts).toBe(1);
  });

  it('makes repeated ACK calls harmless', async () => {
    const queue = createTestQueue();
    const handler = vi.fn((_message, { ack }) => {
      ack();
      expect(() => ack()).not.toThrow();
    });
    queue.createTopic('jobs');
    queue.subscribe('jobs', handler);

    queue.publish('jobs', 'job');
    await waitForCondition(() => handler.mock.calls.length === 1);
    await flushMicrotasks();

    expect(handler).toHaveBeenCalledOnce();
    expect(queue.getDeadLetterMessages('jobs')).toEqual([]);
  });

  it('keeps ACK as the result when ACK wins a race with NACK and an exception', async () => {
    const queue = createTestQueue();
    let deliveries = 0;
    queue.createTopic('jobs');
    queue.subscribe('jobs', (_message, { ack, nack }) => {
      deliveries += 1;
      ack();
      nack(new Error('too late'));
      throw new Error('also too late');
    });

    queue.publish('jobs', 'job');
    await waitForCondition(() => deliveries === 1);
    await flushMicrotasks();

    expect(deliveries).toBe(1);
    expect(queue.getDeadLetterMessages('jobs')).toEqual([]);
  });

  it('keeps NACK as the result when NACK wins a race with ACK', async () => {
    const queue = createTestQueue();
    const attempts: number[] = [];
    queue.createTopic('jobs');
    queue.subscribe(
      'jobs',
      (message, { ack, nack }) => {
        attempts.push(message.attempts);
        if (attempts.length === 1) {
          nack();
          ack();
        } else {
          ack();
        }
      },
      { maxRetries: 1 },
    );

    queue.publish('jobs', 'job');
    await waitForCondition(() => attempts.length === 2);

    expect(attempts).toEqual([0, 1]);
  });
});
