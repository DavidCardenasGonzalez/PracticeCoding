import { carts, inventory, prices, products } from './data.js';

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export class ServiceError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ServiceError';
    Object.assign(this, details);
  }
}

class ConcurrentClient {
  #activeRequests = 0;

  constructor({ latency, maxConcurrent = Infinity } = {}) {
    this.latency = latency ?? 25;
    this.maxConcurrent = maxConcurrent;
  }

  async run(operation) {
    this.#activeRequests += 1;
    if (this.#activeRequests > this.maxConcurrent) {
      this.#activeRequests -= 1;
      throw new ServiceError('Too many concurrent requests', {
        code: 'RATE_LIMITED',
        retryable: true,
      });
    }

    try {
      await wait(this.latency);
      return await operation();
    } finally {
      this.#activeRequests -= 1;
    }
  }
}

export class CartClient extends ConcurrentClient {
  async getCart(cartId) {
    return this.run(() => {
      const cart = carts.get(cartId);
      if (!cart) {
        throw new ServiceError(`Cart ${cartId} was not found`, {
          code: 'NOT_FOUND',
          retryable: false,
        });
      }
      return structuredClone(cart);
    });
  }
}

export class CatalogClient extends ConcurrentClient {
  async getProduct(sku) {
    return this.run(() => {
      const product = products.get(sku);
      if (!product) {
        throw new ServiceError(`Product ${sku} was not found`, {
          code: 'NOT_FOUND',
          retryable: false,
        });
      }
      return { ...product };
    });
  }
}

export class PricingClient extends ConcurrentClient {
  async getPrice(sku) {
    return this.run(() => {
      const price = prices.get(sku);
      if (price === undefined) {
        throw new ServiceError(`Price for ${sku} was not found`, {
          code: 'NOT_FOUND',
          retryable: false,
        });
      }
      return price;
    });
  }
}

export class InventoryClient extends ConcurrentClient {
  async getAvailability(sku) {
    return this.run(() => {
      const availableUnits = inventory.get(sku);
      if (availableUnits === undefined) {
        throw new ServiceError(`Inventory for ${sku} was not found`, {
          code: 'NOT_FOUND',
          retryable: false,
        });
      }
      return { available: availableUnits > 0, availableUnits };
    });
  }
}

export class TaxClient extends ConcurrentClient {
  async calculate({ country, subtotal }) {
    return this.run(() => ({ rate: country === 'MX' ? 0.16 : 0.1, amount: Math.round(subtotal * (country === 'MX' ? 0.16 : 0.1)) }));
  }
}

export class RecommendationClient extends ConcurrentClient {
  constructor(options = {}) {
    super(options);
    this.shouldFail = options.shouldFail ?? false;
  }

  async getRecommendations(customerId, categories) {
    return this.run(() => {
      if (this.shouldFail) {
        throw new ServiceError(`Recommendations unavailable for ${customerId}`, {
          code: 'UPSTREAM_UNAVAILABLE',
          retryable: true,
        });
      }
      return [...new Set(categories)].slice(0, 3).map((category) => `more-${category}`);
    });
  }
}
