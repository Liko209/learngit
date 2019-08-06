jest.mock('pubnub', () => {
  const mock = {
    stop: jest.fn(),
    unsubscribeAll: jest.fn(),
    addListener: jest.fn(),
    subscribe: jest.fn(),
    decrypt: jest.fn(),
  };
  return () => mock;
});
