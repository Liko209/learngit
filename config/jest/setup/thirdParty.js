jest.mock('quill');
jest.mock('react-quill');
jest.mock('downshift');
jest.mock('@/modules/telephony/HOC');

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
