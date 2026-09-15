import { createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { AuditCsvTransform } from './src/csv-transform.js';
import { AuditEventStream } from './src/event-source.js';

export async function exportAuditEvents({ count, outputPath }) {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('count must be a positive integer');
  }

  await pipeline(
    new AuditEventStream({ count }),
    new AuditCsvTransform(),
    createGzip({ level: 6 }),
    createWriteStream(outputPath),
  );
}
