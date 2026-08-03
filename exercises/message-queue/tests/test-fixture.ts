import { afterEach, vi } from 'vitest';

import { MessageQueue } from '../src/index.js';

const queues = new Set<MessageQueue>();

export function createTestQueue(): MessageQueue {
  const queue = new MessageQueue();
  queues.add(queue);
  return queue;
}

afterEach(async () => {
  await Promise.allSettled([...queues].map((queue) => queue.shutdown()));
  queues.clear();
  vi.useRealTimers();
});
