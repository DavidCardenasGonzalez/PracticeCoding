import { Transform } from 'node:stream';

const columns = ['eventId', 'occurredAt', 'action', 'actorId', 'customerId', 'source', 'region', 'note'];

function escapeCsv(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export class AuditCsvTransform extends Transform {
  #remainder = '';
  #headerWritten = false;

  constructor(options = {}) {
    super({ ...options, readableObjectMode: false, writableObjectMode: false });
  }

  _transform(chunk, encoding, callback) {
    const text = this.#remainder + chunk.toString(encoding === 'buffer' ? 'utf8' : encoding);
    const lines = text.split('\n');
    this.#remainder = lines.pop() ?? '';

    try {
      if (!this.#headerWritten) {
        this.push(`${columns.join(',')}\n`);
        this.#headerWritten = true;
      }

      for (const line of lines) {
        if (!line) {
          continue;
        }
        const event = JSON.parse(line);
        const row = [
          event.eventId,
          event.occurredAt,
          event.action,
          event.actorId,
          event.customerId,
          event.metadata.source,
          event.metadata.region,
          event.metadata.note,
        ].map(escapeCsv);
        this.push(`${row.join(',')}\n`);
      }
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _flush(callback) {
    try {
      if (this.#remainder) {
        const event = JSON.parse(this.#remainder);
        const row = [
          event.eventId,
          event.occurredAt,
          event.action,
          event.actorId,
          event.customerId,
          event.metadata.source,
          event.metadata.region,
          event.metadata.note,
        ].map(escapeCsv);
        this.push(`${row.join(',')}\n`);
      }
      callback();
    } catch (error) {
      callback(error);
    }
  }
}
