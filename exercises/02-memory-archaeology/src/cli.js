import { performance } from 'node:perf_hooks';
import {
  AuditClient,
  CustomerClient,
  PriceClient,
  ProductClient,
  RiskClient,
} from './clients.js';
import { defaultOrder } from './data.js';
import { OrderPreviewService } from './order-preview-service.js';

const requestCount = Number(process.argv[2] ?? 2000);
const service = new OrderPreviewService({
  customerClient: new CustomerClient({ latency: 1 }),
  productClient: new ProductClient({ latency: 1 }),
  priceClient: new PriceClient({ latency: 1 }),
  riskClient: new RiskClient({ latency: 1 }),
  auditClient: new AuditClient(),
});

globalThis.gc?.();
const before = process.memoryUsage().heapUsed;
const startedAt = performance.now();

try {
  for (let index = 0; index < requestCount; index += 1) {
    await service.buildPreview({
      ...defaultOrder,
      requestId: `load-${index}`,
      channel: index % 2 === 0 ? 'web' : 'mobile',
    });
  }

  globalThis.gc?.();
  const after = process.memoryUsage().heapUsed;
  const elapsed = Math.round(performance.now() - startedAt);
  const delta = Math.round((after - before) / 1024 / 1024);

  console.log(`Processed ${requestCount} order previews in ${elapsed} ms`);
  console.log(`Heap before: ${Math.round(before / 1024 / 1024)} MB`);
  console.log(`Heap after: ${Math.round(after / 1024 / 1024)} MB`);
  console.log(`Heap delta: ${delta} MB`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
