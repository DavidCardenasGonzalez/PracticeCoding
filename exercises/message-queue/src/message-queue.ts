import {
  TopicAlreadyExistsError,
  TopicNotFoundError,
  InvalidTopicNameError,
  TopicNotEmptyError,
  InvalidPublishOptionsError,
  InvalidSubscribeOptionsError,
  QueueShutdownError,
} from './errors.js';
import type {
  Message,
  MessageHandler,
  PublishOptions,
  SubscribeOptions,
  Subscription,
} from './types.js';

/**
 * In-memory priority message queue.
 *
 * This class intentionally contains only compilable stubs. Implementing its
 * behavior is the exercise; the tests and README are the specification.
 */
export class MessageQueue {
  topics: Set<string> = new Set();
  messages: Map<string, Message[]> = new Map();
  deathLetterMessages: Map<string, Message[]> = new Map();
  subscriptions: Map<string, Subscription[]> = new Map();
  nextId: number = 0;
  isShutdown: boolean = false;
  private activeHandlers = new Set<Promise<void>>();
  private shutdownPromise?: Promise<void>;
  private retryTimers = new Set<ReturnType<typeof setTimeout>>();

  createTopic(_topic: string): void {
    const regex = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
    if (!regex.test(_topic) || _topic.length > 64 || _topic.length < 1) {
      throw new InvalidTopicNameError('');
    }

    const alreadyExist = this.topics.has(_topic);
    if (alreadyExist) {
      throw new TopicAlreadyExistsError('');
    }
    this.topics.add(_topic);
    this.messages.set(_topic, []);
    this.subscriptions.set(_topic, []);
    this.deathLetterMessages.set(_topic, []);
  }

  deleteTopic(_topic: string): void {
    const alreadyExist = this.topics.has(_topic);
    const message = this.messages.get(_topic) || [];
    const hasInFlight =
      this.subscriptions.get(_topic)?.some((subscription) => subscription.inFlight > 0) ??
      false;

    if (!alreadyExist) {
      throw new TopicNotFoundError('');
    } else if (hasInFlight || message.length > 0) {
      throw new TopicNotEmptyError('');
    } else {
      this.topics.delete(_topic);
      this.messages.delete(_topic);
      this.subscriptions.delete(_topic);
      this.deathLetterMessages.delete(_topic);
    }
  }

  publish<T>(_topic: string, _payload: T, _options?: PublishOptions): string {
    if (this.isShutdown) {
      throw new QueueShutdownError('');
    }
    const alreadyExist = this.topics.has(_topic);
    if (!alreadyExist) {
      throw new TopicNotFoundError('');
    }
    const priority = _options?.priority ?? 0;

    if (!Number.isInteger(priority) || priority < 0 || priority > 10) {
      throw new InvalidPublishOptionsError('');
    }
    const id = 'id-' + this.generateNextId();
    const msg: Message = {
      id: id,
      topic: _topic,
      payload: _payload,
      priority: _options?.priority || 0,
      attempts: 0,
      createdAt: new Date(),
    };
    this.messages.get(_topic)?.push(msg);
    queueMicrotask(() => {
      void this.dispatch(_topic);
    });
    return id;
  }

  subscribe<T>(
    _topic: string,
    _handler: MessageHandler<T>,
    _options?: SubscribeOptions,
  ): () => void {
    if (this.isShutdown) {
      throw new QueueShutdownError('');
    }
    const alreadyExist = this.topics.has(_topic);
    const concurrency = _options?.concurrency ?? 1;
    const maxRetries = _options?.maxRetries ?? 3;
    const retryDelayMs = _options?.retryDelayMs ?? 0;
    if (!alreadyExist) {
      throw new TopicNotFoundError('');
    }
    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new InvalidSubscribeOptionsError('');
    }

    if (!Number.isInteger(maxRetries) || maxRetries < 0) {
      throw new InvalidSubscribeOptionsError('');
    }

    if (!Number.isFinite(retryDelayMs) || retryDelayMs < 0) {
      throw new InvalidSubscribeOptionsError('');
    }
    const subs: Subscription = {
      active: true,
      concurrency,
      maxRetries,
      retryDelayMs,
      inFlight: 0,
      handler: (message, context) => {
        return _handler(message as Message<T>, context);
      },
    };
    this.subscriptions.get(_topic)?.push(subs);
    queueMicrotask(() => {
      void this.dispatch(_topic);
    });
    return () => {
      subs.active = false;
    };
  }

  getQueueSize(_topic: string): number {
    const alreadyExist = this.topics.has(_topic);
    if (!alreadyExist) {
      throw new TopicNotFoundError('');
    }
    return this.messages.get(_topic)?.length || 0;
  }

  getDeadLetterMessages(_topic: string): ReadonlyArray<Message> {
    const alreadyExist = this.topics.has(_topic);
    if (!alreadyExist) {
      throw new TopicNotFoundError('');
    }
    return [...(this.deathLetterMessages.get(_topic) ?? [])];
  }

  shutdown(): Promise<void> {
    this.isShutdown = true;
    if (this.shutdownPromise) {
      return this.shutdownPromise;
    }

    this.isShutdown = true;

    this.shutdownPromise = Promise.allSettled([...this.activeHandlers]).then(
      () => undefined,
    );
    for (const timer of this.retryTimers) {
      clearTimeout(timer);
    }

    this.retryTimers.clear();
    return this.shutdownPromise;
  }

  private async dispatch(_topic: string) {
    if (this.isShutdown) {
      return;
    }
    const pendingMessage = this.messages.get(_topic) || [];
    const subscriptions = this.subscriptions.get(_topic) || [];
    const availbleSubcriptions = subscriptions?.find(
      (sbs) => sbs.active && sbs.concurrency > sbs.inFlight,
    );
    pendingMessage.sort((a, b) => b.priority - a.priority);

    if (pendingMessage?.length > 0 && availbleSubcriptions) {
      const message = pendingMessage.shift();
      let settled = false;
      availbleSubcriptions.inFlight++;
      const ack = () => {
        if (settled) return;

        settled = true;
        availbleSubcriptions.inFlight--;
        setImmediate(() => {
          this.dispatch(_topic);
        });
      };
      const nack = (err?: Error | undefined) => {
        if (settled) return;

        settled = true;
        const retryMessage: Message = {
          ...(message as Message),
          attempts: (message?.attempts || 0) + 1,
        };
        availbleSubcriptions.inFlight--;
        if (retryMessage.attempts <= availbleSubcriptions.maxRetries) {
          pendingMessage.push(retryMessage);
          const timer = setTimeout(() => {
            queueMicrotask(() => {
              void this.dispatch(_topic);
            });
          }, availbleSubcriptions.retryDelayMs);
          this.retryTimers.add(timer);
        } else {
          this.deathLetterMessages.get(_topic)?.push(retryMessage as Message);
          console.log(err);
        }
      };
      const handlerPromise: Promise<void> = Promise.resolve().then(() => {
        return availbleSubcriptions.handler(message as Message, { ack, nack });
      });
      try {
        this.activeHandlers.add(handlerPromise);
        await handlerPromise;
        // Handler terminó sin resolver el mensaje
        if (!settled) {
          nack();
        }
      } catch (error) {
        // Error síncrono o Promise rechazada
        if (!settled) {
          nack(error instanceof Error ? error : new Error(String(error)));
        }
      } finally {
        this.activeHandlers.delete(handlerPromise);
      }
    }
  }

  private generateNextId() {
    this.nextId++;
    return this.nextId;
  }
}
