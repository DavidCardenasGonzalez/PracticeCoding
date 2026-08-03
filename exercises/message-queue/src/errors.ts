export class MessageQueueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidTopicNameError extends MessageQueueError {}

export class TopicAlreadyExistsError extends MessageQueueError {}

export class TopicNotFoundError extends MessageQueueError {}

export class TopicNotEmptyError extends MessageQueueError {}

export class InvalidPublishOptionsError extends MessageQueueError {}

export class InvalidSubscribeOptionsError extends MessageQueueError {}

export class QueueShutdownError extends MessageQueueError {}

export class NotImplementedError extends MessageQueueError {
  constructor(method: string) {
    super(`MessageQueue.${method} is not implemented`);
  }
}
