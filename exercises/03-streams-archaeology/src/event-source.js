import { Readable } from 'node:stream';

function buildAuditEvent(sequence) {
  const customerId = `customer-${(sequence % 500) + 1}`;
  return {
    eventId: `evt-${sequence}`,
    occurredAt: new Date(1_700_000_000_000 + sequence * 1_000).toISOString(),
    action: sequence % 3 === 0 ? 'order.updated' : 'order.viewed',
    actorId: `agent-${(sequence % 20) + 1}`,
    customerId,
    metadata: {
      source: sequence % 2 === 0 ? 'web' : 'mobile',
      region: sequence % 4 === 0 ? 'north' : 'south',
      note: `support-case-${customerId}-${sequence}`.padEnd(260, '.'),
    },
  };
}

export class AuditEventStream extends Readable {
  #sequence = 0;

  constructor({ count, highWaterMark = 16 * 1024 } = {}) {
    super({ highWaterMark });
    this.count = count;
  }

  _read() {
    while (this.#sequence < this.count) {
      const event = `${JSON.stringify(buildAuditEvent(this.#sequence))}\n`;
      this.#sequence += 1;
      if (!this.push(event)) {
        console.log('release');
        return;
      }
    }

    this.push(null);
  }
}
