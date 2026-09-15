import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { createGunzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { AuditCsvTransform } from '../src/csv-transform.js';
import { AuditEventStream } from '../src/event-source.js';
import { exportAuditEvents } from '../export-service.js';

test('exports audit events as a compressed CSV file', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'streams-archaeology-'));
  const outputPath = join(directory, 'audit.csv.gz');

  try {
    await exportAuditEvents({ count: 4, outputPath });
    const compressed = await readFile(outputPath);
    const chunks = [];
    const source = (async function* () {
      yield compressed;
    })();
    const collector = new (await import('node:stream')).Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.from(chunk, encoding));
        callback();
      },
    });

    await pipeline(source, createGunzip(), collector);
    const csv = Buffer.concat(chunks).toString('utf8');
    const lines = csv.trimEnd().split('\n');

    assert.equal(lines.length, 5);
    assert.match(lines[0], /^eventId,occurredAt,action/);
    assert.match(lines[1], /^evt-0,/);
    assert.ok((await stat(outputPath)).size > 0);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('preserves records when JSON lines arrive in arbitrary chunks', async () => {
  const transform = new AuditCsvTransform();
  const chunks = [];
  transform.on('data', (chunk) => chunks.push(chunk));

  const first = JSON.stringify({
    eventId: 'evt-a',
    occurredAt: '2026-01-01T00:00:00.000Z',
    action: 'order.viewed',
    actorId: 'agent-1',
    customerId: 'customer-1',
    metadata: { source: 'web', region: 'north', note: 'ok' },
  });
  const second = JSON.stringify({
    eventId: 'evt-b',
    occurredAt: '2026-01-01T00:00:01.000Z',
    action: 'order.updated',
    actorId: 'agent-2',
    customerId: 'customer-2',
    metadata: { source: 'mobile', region: 'south', note: 'ok' },
  });

  transform.write(first.slice(0, 20));
  transform.write(`${first.slice(20)}\n${second.slice(0, 10)}`);
  transform.end(`${second.slice(10)}\n`);

  await new Promise((resolve, reject) => {
    transform.once('finish', resolve);
    transform.once('error', reject);
  });

  const csv = Buffer.concat(chunks).toString('utf8');
  assert.equal(csv.split('\n').filter(Boolean).length, 3);
  assert.match(csv, /evt-a/);
  assert.match(csv, /evt-b/);
});

test('emits every event when the consumer reads slowly', async () => {
  const source = new AuditEventStream({ count: 40, highWaterMark: 1 });
  let count = 0;

  for await (const chunk of source) {
    assert.ok(chunk.length > 0);
    count += 1;
    await new Promise((resolve) => setTimeout(resolve, 1));
  }

  assert.equal(count, 40);
});
