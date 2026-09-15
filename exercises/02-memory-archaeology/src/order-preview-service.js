import { EventEmitter } from 'node:events';
import { createRequestContext } from './request-context.js';

export class OrderPreviewService {
  constructor({ customerClient, productClient, priceClient, riskClient, auditClient, eventBus }) {
    this.customerClient = customerClient;
    this.productClient = productClient;
    this.priceClient = priceClient;
    this.riskClient = riskClient;
    this.auditClient = auditClient;
    this.eventBus = eventBus ?? new EventEmitter();
    this.eventBus.setMaxListeners(0);
  }

  async buildPreview({ requestId, customerId, channel = 'web', country, currency, items }) {
    const context = createRequestContext({ requestId, customerId, channel });
    const customer = await this.customerClient.getCustomer(customerId);

    const lines = await Promise.all(
      items.map(async (item) => {
        const [product, unitPrice] = await Promise.all([
          this.productClient.getProduct(item.sku),
          this.priceClient.getPrice(item.sku),
        ]);

        return {
          sku: item.sku,
          name: product.name,
          category: product.category,
          quantity: item.quantity,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
        };
      }),
    );

    const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
    const risk = await this.riskClient.check({ customerId, amount: subtotal, country });

    this.eventBus.on('preview.completed-' + context.requestId, (event) => {
      if (event.requestId !== context.requestId) {
        return;
      }
      this.auditClient.record({
        requestId: context.requestId,
        customerId: context.customerId,
        channel: context.channel,
        total: event.total,
      });
      this.eventBus.removeAllListeners('preview.completed-' + context.requestId);
    });

    const taxAmount = Math.round(subtotal * (country === 'MX' ? 0.16 : 0.1));
    const total = subtotal + taxAmount;
    this.eventBus.emit('preview.completed-' + context.requestId, { requestId, total });

    return {
      requestId,
      customer: { id: customer.id, name: customer.name },
      currency,
      lines,
      subtotal,
      taxAmount,
      total,
      risk,
    };
  }
}
