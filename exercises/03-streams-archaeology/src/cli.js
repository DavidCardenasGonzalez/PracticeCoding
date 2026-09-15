import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
import { exportAuditEvents } from '../export-service.js';

const count = Number(process.argv[2] ?? 100_000);
const outputPath = resolve('audit-export.csv.gz');

globalThis.gc?.();
const before = process.memoryUsage().heapUsed;
const startedAt = performance.now();

try {
  await exportAuditEvents({ count, outputPath });
  globalThis.gc?.();
  const after = process.memoryUsage().heapUsed;
  const elapsed = Math.round(performance.now() - startedAt);
  const beforeMb = Math.round(before / 1024 / 1024);
  const afterMb = Math.round(after / 1024 / 1024);
  const deltaMb = Math.round((after - before) / 1024 / 1024);

  console.log(`Exported ${count} audit events in ${elapsed} ms`);
  console.log(`Output: ${outputPath}`);
  console.log(`Heap before: ${beforeMb} MB`);
  console.log(`Heap after: ${afterMb} MB`);
  console.log(`Heap delta: ${deltaMb} MB`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
