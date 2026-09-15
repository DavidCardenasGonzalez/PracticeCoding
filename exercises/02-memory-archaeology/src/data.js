export const customers = new Map([
  ['customer-77', { id: 'customer-77', name: 'Marina López', segment: 'standard' }],
  ['customer-91', { id: 'customer-91', name: 'Diego Ramos', segment: 'business' }],
]);

export const products = new Map([
  ['coffee-beans', { sku: 'coffee-beans', name: 'House coffee beans', category: 'coffee' }],
  ['ceramic-mug', { sku: 'ceramic-mug', name: 'Ceramic mug', category: 'drinkware' }],
  ['pour-over', { sku: 'pour-over', name: 'Glass pour-over', category: 'equipment' }],
  ['paper-filters', { sku: 'paper-filters', name: 'Paper filters', category: 'accessories' }],
]);

export const prices = new Map([
  ['coffee-beans', 189],
  ['ceramic-mug', 249],
  ['pour-over', 649],
  ['paper-filters', 119],
]);

export const defaultOrder = {
  customerId: 'customer-77',
  currency: 'MXN',
  country: 'MX',
  items: [
    { sku: 'coffee-beans', quantity: 2 },
    { sku: 'ceramic-mug', quantity: 1 },
    { sku: 'paper-filters', quantity: 2 },
  ],
};
