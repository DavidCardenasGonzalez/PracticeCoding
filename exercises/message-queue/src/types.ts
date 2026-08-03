export interface Message<T = unknown> {
  readonly id: string;
  readonly topic: string;
  readonly payload: T;
  readonly priority: number;
  readonly attempts: number;
  readonly createdAt: Date;
}

export interface PublishOptions {
  /** Integer from 0 through 10. Higher values are delivered first. */
  priority?: number;
}

export interface SubscribeOptions {
  /** Maximum number of messages handled in parallel by this subscription. */
  concurrency?: number;
  /** Additional delivery attempts after the initial attempt. */
  maxRetries?: number;
  /** Delay before each retry becomes eligible for delivery. */
  retryDelayMs?: number;
}

export interface MessageContext {
  ack(): void;
  nack(error?: Error): void;
}

export type MessageHandler<T = unknown> = (
  message: Message<T>,
  context: MessageContext,
) => void | Promise<void>;
