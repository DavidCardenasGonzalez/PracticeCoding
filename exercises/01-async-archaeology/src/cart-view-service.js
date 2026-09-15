export class CartViewService {
  constructor({
    cartClient,
    catalogClient,
    pricingClient,
    inventoryClient,
    taxClient,
    recommendationClient,
  }) {
    this.cartClient = cartClient;
    this.catalogClient = catalogClient;
    this.pricingClient = pricingClient;
    this.inventoryClient = inventoryClient;
    this.taxClient = taxClient;
    this.recommendationClient = recommendationClient;
  }

  async getCartView(cartId) {
    const cart = await this.cartClient.getCart(cartId);
    const productBySku = new Map();
    const priceBySku = new Map();
    const availabilityBySku = new Map();

    const maxConcurrent = Math.min(
      this.catalogClient.maxConcurrent,
      this.pricingClient.maxConcurrent,
      this.inventoryClient.maxConcurrent,
    );
    const batchSize = Number.isFinite(maxConcurrent) ? maxConcurrent : Math.max(1, cart.items.length);

    if (!Number.isInteger(batchSize) || batchSize < 1) {
      throw new Error('Service concurrency limits must be positive integers');
    }

    // Aquí debías usar el límite superior sin restar uno; antes se había dejado
    // `start + maxConcurrent - 1`, que excluía el último elemento de cada lote.
    const concurrentCartItems = [];
    for (let start = 0; start < cart.items.length; start += batchSize) {
      concurrentCartItems.push(cart.items.slice(start, start + batchSize));
    }

    const requests = [];
    for (const subList of concurrentCartItems) {
      const requestsSubList = await Promise.all(
        subList.flatMap((item) => [
          this.catalogClient.getProduct(item.sku),
          this.pricingClient.getPrice(item.sku),
          this.inventoryClient.getAvailability(item.sku),
        ]),
      );
      requests.push(...requestsSubList);
    }
    for (let i = 0; i < cart.items.length; i++) {
      productBySku.set(cart.items[i].sku, requests[i * 3]);
      priceBySku.set(cart.items[i].sku, requests[i * 3 + 1]);
      availabilityBySku.set(cart.items[i].sku, requests[i * 3 + 2]);
    }

    const lineResults = cart.items.map((item) => {
      const unitPrice = priceBySku.get(item.sku);
      const availability = availabilityBySku.get(item.sku);
      const product = productBySku.get(item.sku);
      const lineTotal = unitPrice * item.quantity;

      return {
        lineId: item.lineId,
        sku: item.sku,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        available: availability.available && availability.availableUnits >= item.quantity,
      };
    });
    const subtotal = lineResults.reduce((total, line) => total + line.lineTotal, 0);
    const [taxResult, recommendationsResult] = await Promise.allSettled([
      this.taxClient.calculate({ country: cart.country, subtotal }),
      this.recommendationClient.getRecommendations(
        cart.customerId,
        lineResults.map((line) => productBySku.get(line.sku).category),
      ),
    ]);

    if (taxResult.status === 'rejected') {
      throw taxResult.reason;
    }

    // Aquí debías permitir que una capacidad secundaria fallara sin descartar
    // la pantalla; antes se había dejado en el mismo `Promise.all` que el impuesto.
    const recommendations = recommendationsResult.status === 'fulfilled' ? recommendationsResult.value : [];

    return {
      cartId: cart.id,
      currency: cart.currency,
      lines: lineResults,
      subtotal,
      tax: taxResult.value,
      total: subtotal + taxResult.value.amount,
      recommendations,
    };
  }
}
