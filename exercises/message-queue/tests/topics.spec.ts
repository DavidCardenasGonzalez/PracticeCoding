import { describe, expect, it } from 'vitest';

import {
  InvalidTopicNameError,
  TopicAlreadyExistsError,
  TopicNotEmptyError,
  TopicNotFoundError,
} from '../src/index.js';
import { createTestQueue } from './test-fixture.js';

describe('MessageQueue topic management', () => {
  it('creates a topic that can be queried', () => {
    const queue = createTestQueue();

    queue.createTopic('orders.created');

    expect(queue.getQueueSize('orders.created')).toBe(0);
    expect(queue.getDeadLetterMessages('orders.created')).toEqual([]);
  });

  it.each(['', ' ', 'Orders', '.orders', 'orders.', 'orders..created', 'orders/created'])(
    'rejects the invalid topic name %j',
    (topic) => {
      const queue = createTestQueue();

      expect(() => queue.createTopic(topic)).toThrow(InvalidTopicNameError);
    },
  );

  it('rejects topic names longer than 64 characters', () => {
    const queue = createTestQueue();

    expect(() => queue.createTopic('a'.repeat(65))).toThrow(InvalidTopicNameError);
  });

  it('rejects a duplicate topic without replacing the original', () => {
    const queue = createTestQueue();
    queue.createTopic('orders');
    queue.publish('orders', { orderId: 1 });

    expect(() => queue.createTopic('orders')).toThrow(TopicAlreadyExistsError);
    expect(queue.getQueueSize('orders')).toBe(1);
  });

  it('deletes an empty topic', () => {
    const queue = createTestQueue();
    queue.createTopic('orders');

    queue.deleteTopic('orders');

    expect(() => queue.getQueueSize('orders')).toThrow(TopicNotFoundError);
  });

  it('throws when deleting a topic that does not exist', () => {
    const queue = createTestQueue();

    expect(() => queue.deleteTopic('missing')).toThrow(TopicNotFoundError);
  });

  it('does not delete a topic with pending messages', () => {
    const queue = createTestQueue();
    queue.createTopic('orders');
    queue.publish('orders', 'pending');

    expect(() => queue.deleteTopic('orders')).toThrow(TopicNotEmptyError);
    expect(queue.getQueueSize('orders')).toBe(1);
  });

  it('allows a deleted topic name to be created again with fresh state', () => {
    const queue = createTestQueue();
    queue.createTopic('orders');
    queue.deleteTopic('orders');

    queue.createTopic('orders');

    expect(queue.getQueueSize('orders')).toBe(0);
    expect(queue.getDeadLetterMessages('orders')).toEqual([]);
  });
});
