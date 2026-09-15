import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CartClient,
  CatalogClient,
  InventoryClient,
  PricingClient,
  RecommendationClient,
  TaxClient,
} from '../src/clients.js';
import { CartViewService } from '../src/cart-view-service.js';

const createService = (overrides = {}) =>
  new CartViewService({
    cartClient: new CartClient({ latency: 1 }),
    catalogClient: new CatalogClient({ latency: 1 }),
    pricingClient: new PricingClient({ latency: 1, maxConcurrent: 10 }),
    inventoryClient: new InventoryClient({ latency: 1, maxConcurrent: 10 }),
    taxClient: new TaxClient({ latency: 1 }),
    recommendationClient: new RecommendationClient({ latency: 1 }),
    ...overrides,
  });

test('builds a cart view with totals and availability', async () => {
  const view = await createService().getCartView('cart-1042');

  assert.equal(view.lines.length, 6);
  assert.equal(view.subtotal, 2561);
  assert.equal(view.tax.amount, 410);
  assert.equal(view.total, 2971);
  assert.equal(view.lines.find((line) => line.sku === 'milk-frother').available, false);
});

test('returns independent line data for repeated reads', async () => {
  const service = createService();
  const first = await service.getCartView('cart-1042');
  const second = await service.getCartView('cart-1042');

  assert.notEqual(first.lines, second.lines);
  assert.deepEqual(first.lines, second.lines);
});

test('preserves the upstream error when the cart does not exist', async () => {
  await assert.rejects(() => createService().getCartView('missing-cart'), {
    code: 'NOT_FOUND',
  });
});

test('keeps every line when the cart is processed in multiple batches', async () => {
  const service = createService({
    catalogClient: new CatalogClient({ latency: 1, maxConcurrent: 3 }),
    pricingClient: new PricingClient({ latency: 1, maxConcurrent: 3 }),
    inventoryClient: new InventoryClient({ latency: 1, maxConcurrent: 3 }),
  });

  const view = await service.getCartView('cart-1042');

  assert.deepEqual(
    view.lines.map((line) => line.sku),
    ['coffee-beans', 'ceramic-mug', 'pour-over', 'paper-filters', 'milk-frother', 'travel-tumbler'],
  );
  assert.equal(view.subtotal, 2561);
});

test('keeps the cart view available when recommendations are unavailable', async () => {
  const service = createService({
    recommendationClient: new RecommendationClient({ latency: 1, shouldFail: true }),
  });

  const view = await service.getCartView('cart-1042');

  assert.deepEqual(view.recommendations, []);
  assert.equal(view.total, 2971);
});
