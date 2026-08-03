import { describe, expect, it } from 'vitest';

import {
  InvalidPublishOptionsError,
  TopicNotFoundError,
  type Message,
} from '../src/index.js';
import { waitForCondition } from '../../../shared/test-utils/index.js';
import { createTestQueue } from './test-fixture.js';

describe('MessageQueue publishing and ordering', () => {
  it('publishes to an existing topic and returns a non-empty ID', () => {
    const queue = createTestQueue();
    queue.createTopic('events');

    const id = queue.publish('events', { value: 1 });

    expect(id).toEqual(expect.any(String));
    expect(id.length).toBeGreaterThan(0);
    expect(queue.getQueueSize('events')).toBe(1);
  });

  it('returns a unique ID for every publication', () => {
    const queue = createTestQueue();
    queue.createTopic('events');

    const ids = Array.from({ length: 200 }, (_, value) =>
      queue.publish('events', { value }),
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('rejects publication to an unknown topic', () => {
    const queue = createTestQueue();

    expect(() => queue.publish('missing', 'payload')).toThrow(TopicNotFoundError);
  });

  it('preserves payload identity and publication metadata', async () => {
    const queue = createTestQueue();
    const payload = { nested: { value: 42 } };
    const received: Message<typeof payload>[] = [];
    const before = Date.now();
    queue.createTopic('events');
    const id = queue.publish('events', payload, { priority: 7 });

    queue.subscribe<typeof payload>('events', (message, { ack }) => {
      received.push(message);
      ack();
    });
    await waitForCondition(() => received.length === 1);

    expect(received[0]).toMatchObject({ id, topic: 'events', priority: 7, attempts: 0 });
    expect(received[0]?.payload).toBe(payload);
    expect(received[0]?.createdAt).toBeInstanceOf(Date);
    expect(received[0]?.createdAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('uses priority zero by default', async () => {
    const queue = createTestQueue();
    let received: Message | undefined;
    queue.createTopic('events');
    queue.publish('events', 'payload');
    queue.subscribe('events', (message, { ack }) => {
      received = message;
      ack();
    });

    await waitForCondition(() => received !== undefined);

    expect(received?.priority).toBe(0);
  });

  it.each([-1, 11, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid priority %s',
    (priority) => {
      const queue = createTestQueue();
      queue.createTopic('events');

      expect(() => queue.publish('events', 'payload', { priority })).toThrow(
        InvalidPublishOptionsError,
      );
    },
  );

  it('preserves FIFO order among messages with equal priority', async () => {
    const queue = createTestQueue();
    const received: number[] = [];
    queue.createTopic('events');
    for (let value = 0; value < 20; value += 1) {
      queue.publish('events', value, { priority: 4 });
    }

    queue.subscribe<number>('events', (message, { ack }) => {
      received.push(message.payload);
      ack();
    });
    await waitForCondition(() => received.length === 20);

    expect(received).toEqual(Array.from({ length: 20 }, (_, value) => value));
  });

  it('delivers higher priority messages first and FIFO within each priority', async () => {
    const queue = createTestQueue();
    const received: string[] = [];
    queue.createTopic('events');
    queue.publish('events', 'low-1', { priority: 1 });
    queue.publish('events', 'high-1', { priority: 9 });
    queue.publish('events', 'low-2', { priority: 1 });
    queue.publish('events', 'high-2', { priority: 9 });

    queue.subscribe<string>('events', (message, { ack }) => {
      received.push(message.payload);
      ack();
    });
    await waitForCondition(() => received.length === 4);

    expect(received).toEqual(['high-1', 'high-2', 'low-1', 'low-2']);
  });
});
