import { NotImplementedError } from './errors.js';
import type {
  Message,
  MessageHandler,
  PublishOptions,
  SubscribeOptions,
} from './types.js';

/**
 * In-memory priority message queue.
 *
 * This class intentionally contains only compilable stubs. Implementing its
 * behavior is the exercise; the tests and README are the specification.
 */
export class MessageQueue {
  createTopic(_topic: string): void {
    throw new NotImplementedError('createTopic');
  }

  deleteTopic(_topic: string): void {
    throw new NotImplementedError('deleteTopic');
  }

  publish<T>(_topic: string, _payload: T, _options?: PublishOptions): string {
    throw new NotImplementedError('publish');
  }

  subscribe<T>(
    _topic: string,
    _handler: MessageHandler<T>,
    _options?: SubscribeOptions,
  ): () => void {
    throw new NotImplementedError('subscribe');
  }

  getQueueSize(_topic: string): number {
    throw new NotImplementedError('getQueueSize');
  }

  getDeadLetterMessages(_topic: string): ReadonlyArray<Message> {
    throw new NotImplementedError('getDeadLetterMessages');
  }

  shutdown(): Promise<void> {
    return Promise.reject(new NotImplementedError('shutdown'));
  }
}
