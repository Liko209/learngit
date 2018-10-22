/// <reference path="../../__tests__/types.d.ts" />

describe('Window event listener', () => {
  beforeAll(() => {
    jest.mock('../notificationCenter');
    jest.spyOn(window, 'addEventListener');
  });
  it('should bind eventListener to window', () => {
    require('../windowEventListener');
    expect(window.addEventListener.mock.calls[0][0]).toBe('online');
    expect(window.addEventListener.mock.calls[1][0]).toBe('offline');
    expect(window.addEventListener.mock.calls[2][0]).toBe('load');
    expect(window.addEventListener.mock.calls[3][0]).toBe('focus');
  });
});
