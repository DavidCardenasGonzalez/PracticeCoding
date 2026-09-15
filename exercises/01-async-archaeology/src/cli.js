import {
  CartClient,
  CatalogClient,
  InventoryClient,
  PricingClient,
  RecommendationClient,
  TaxClient,
} from './clients.js';
import { CartViewService } from './cart-view-service.js';

const service = new CartViewService({
  cartClient: new CartClient({ latency: 20 }),
  catalogClient: new CatalogClient({ latency: 45 }),
  pricingClient: new PricingClient({ latency: 35, maxConcurrent: 8 }),
  inventoryClient: new InventoryClient({ latency: 30, maxConcurrent: 8 }),
  taxClient: new TaxClient({ latency: 25 }),
  recommendationClient: new RecommendationClient({ latency: 40 }),
});

const startedAt = performance.now();

try {
  const view = await service.getCartView('cart-1042');
  const elapsed = Math.round(performance.now() - startedAt);
  console.log(`Cart ${view.cartId}: ${view.lines.length} lines, total ${view.total} ${view.currency}`);
  console.log(`Recommendations: ${view.recommendations.join(', ')}`);
  console.log(`Elapsed: ${elapsed} ms`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
