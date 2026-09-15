export function createRequestContext({ requestId, customerId, channel }) {
  const breadcrumbs = Array.from({ length: 96 }, (_, index) => ({
    key: `${requestId}:step:${index}`,
    value: `${channel}:${customerId}:${index}`,
    createdAt: Date.now(),
  }));

  return {
    requestId,
    customerId,
    channel,
    createdAt: Date.now(),
    breadcrumbs,
  };
}
