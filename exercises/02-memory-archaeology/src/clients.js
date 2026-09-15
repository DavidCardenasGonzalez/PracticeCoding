import { customers, prices, products } from './data.js';

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export class DependencyError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'DependencyError';
    this.code = code;
  }
}

class ServiceClient {
  constructor({ latency = 2 } = {}) {
    this.latency = latency;
  }

  async request(operation) {
    await wait(this.latency);
    return operation();
  }
}

export class CustomerClient extends ServiceClient {
  async getCustomer(customerId) {
    return this.request(() => {
      const customer = customers.get(customerId);
      if (!customer) {
        throw new DependencyError(`Customer ${customerId} was not found`, 'CUSTOMER_NOT_FOUND');
      }
      return { ...customer };
    });
  }
}

export class ProductClient extends ServiceClient {
  async getProduct(sku) {
    return this.request(() => {
      const product = products.get(sku);
      if (!product) {
        throw new DependencyError(`Product ${sku} was not found`, 'PRODUCT_NOT_FOUND');
      }
      return { ...product };
    });
  }
}

export class PriceClient extends ServiceClient {
  async getPrice(sku) {
    return this.request(() => {
      const price = prices.get(sku);
      if (price === undefined) {
        throw new DependencyError(`Price for ${sku} was not found`, 'PRICE_NOT_FOUND');
      }
      return price;
    });
  }
}

export class RiskClient extends ServiceClient {
  async check({ customerId, amount, country }) {
    return this.request(() => ({
      decision: amount > 3_000 && country !== 'MX' ? 'review' : 'approve',
      customerId,
      checkedAt: new Date().toISOString(),
    }));
  }
}

export class AuditClient {
  #recordsWritten = 0;
  #lastRecord = null;

  record(entry) {
    this.#recordsWritten += 1;
    this.#lastRecord = { ...entry };
  }

  getStats() {
    return { recordsWritten: this.#recordsWritten, lastRecord: this.#lastRecord };
  }
}
