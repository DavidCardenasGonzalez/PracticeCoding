export const carts = new Map([
  [
    'cart-1042',
    {
      id: 'cart-1042',
      customerId: 'customer-77',
      country: 'MX',
      currency: 'MXN',
      items: [
        { lineId: 'line-1', sku: 'coffee-beans', quantity: 2 },
        { lineId: 'line-2', sku: 'ceramic-mug', quantity: 1 },
        { lineId: 'line-3', sku: 'pour-over', quantity: 1 },
        { lineId: 'line-4', sku: 'paper-filters', quantity: 3 },
        { lineId: 'line-5', sku: 'milk-frother', quantity: 1 },
        { lineId: 'line-6', sku: 'travel-tumbler', quantity: 1 },
      ],
    },
  ],
]);

export const products = new Map([
  ['coffee-beans', { sku: 'coffee-beans', name: 'House coffee beans', category: 'coffee' }],
  ['ceramic-mug', { sku: 'ceramic-mug', name: 'Ceramic mug', category: 'drinkware' }],
  ['pour-over', { sku: 'pour-over', name: 'Glass pour-over', category: 'equipment' }],
  ['paper-filters', { sku: 'paper-filters', name: 'Paper filters', category: 'accessories' }],
  ['milk-frother', { sku: 'milk-frother', name: 'Handheld milk frother', category: 'equipment' }],
  ['travel-tumbler', { sku: 'travel-tumbler', name: 'Travel tumbler', category: 'drinkware' }],
]);

export const prices = new Map([
  ['coffee-beans', 189],
  ['ceramic-mug', 249],
  ['pour-over', 649],
  ['paper-filters', 119],
  ['milk-frother', 399],
  ['travel-tumbler', 529],
]);

export const inventory = new Map([
  ['coffee-beans', 12],
  ['ceramic-mug', 4],
  ['pour-over', 7],
  ['paper-filters', 30],
  ['milk-frother', 0],
  ['travel-tumbler', 9],
]);
