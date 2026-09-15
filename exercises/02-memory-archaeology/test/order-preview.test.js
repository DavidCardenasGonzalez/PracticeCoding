import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AuditClient,
  CustomerClient,
  PriceClient,
  ProductClient,
  RiskClient,
} from '../src/clients.js';
import { defaultOrder } from '../src/data.js';
import { OrderPreviewService } from '../src/order-preview-service.js';

const createService = (overrides = {}) =>
  new OrderPreviewService({
    customerClient: new CustomerClient({ latency: 0 }),
    productClient: new ProductClient({ latency: 0 }),
    priceClient: new PriceClient({ latency: 0 }),
    riskClient: new RiskClient({ latency: 0 }),
    auditClient: new AuditClient(),
    ...overrides,
  });

test('builds an order preview with pricing and risk information', async () => {
  const preview = await createService().buildPreview({
    ...defaultOrder,
    requestId: 'test-1',
  });

  assert.equal(preview.customer.name, 'Marina López');
  assert.equal(preview.subtotal, 865);
  assert.equal(preview.taxAmount, 138);
  assert.equal(preview.total, 1003);
  assert.equal(preview.risk.decision, 'approve');
});

test('records a completed preview for support tools', async () => {
  const auditClient = new AuditClient();
  const service = createService({ auditClient });

  await service.buildPreview({ ...defaultOrder, requestId: 'test-2', channel: 'mobile' });

  assert.deepEqual(auditClient.getStats(), {
    recordsWritten: 1,
    lastRecord: {
      requestId: 'test-2',
      customerId: 'customer-77',
      channel: 'mobile',
      total: 1003,
    },
  });
});

test('rejects an order containing an unknown product', async () => {
  await assert.rejects(
    () => createService().buildPreview({
      ...defaultOrder,
      requestId: 'test-3',
      items: [{ sku: 'unknown-product', quantity: 1 }],
    }),
    { code: 'PRODUCT_NOT_FOUND' },
  );
});
