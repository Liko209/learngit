import { Notification } from '@/containers/Notification';
import { ERROR_CODES_NETWORK, JNetworkError, JServerError, ERROR_CODES_SERVER } from 'sdk/error';
import { CatchError } from '../catchError';

jest.mock('@/containers/Notification');
class MockFunc {
  static mockCallback = jest.fn((error: Error, ctx: any) => ({ error, ctx }));

  @CatchError.flash({
    network: MockFunc.mockCallback,
    server: 'ServerIssue',
  })
  static async testFlash(errorType: 'network' | 'server' | 'other') {
    if (errorType === 'network') {
      throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
    }
    if (errorType === 'server') {
      throw new JServerError(ERROR_CODES_SERVER.GENERAL, '');
    }
    throw new Error();
  }

  @CatchError.flag({
    network: 'NetworkIssue',
    server: MockFunc.mockCallback,
  })
  static testFlag(errorType: 'network' | 'server' | 'other') {
    if (errorType === 'network') {
      throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');
    }
    if (errorType === 'server') {
      throw new JServerError(ERROR_CODES_SERVER.GENERAL, '');
    }
    throw new Error();
  }
}

describe('CatchError.flash()', () => {
  beforeEach(() => {
    Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
    jest.clearAllMocks();
  });

  it('flash notification when it has network issue', (done: jest.DoneCallback) => {
    MockFunc.testFlash('network');
    setTimeout(() => {
      expect(MockFunc.mockCallback).toHaveBeenCalled();
      done();
    },         0);
  });

  it('flash notification when it has server issue', (done: jest.DoneCallback) => {
    MockFunc.testFlash('server');
    setTimeout(() => {
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ServerIssue',
        }),
      );
      done();
    },         0);
  });

  it('flash notification when it has other kinds of issue(not network or server issue)', async () => {
    await expect(MockFunc.testFlash('other')).rejects.toThrow(new Error());
  });
});

describe('CatchError.flag()', () => {
  beforeEach(() => {
    Notification.flagToast = jest.fn().mockImplementationOnce(() => {});
    jest.clearAllMocks();
  });

  it('flag notification when it has network issue', (done: jest.DoneCallback) => {
    MockFunc.testFlag('network');
    setTimeout(() => {
      expect(Notification.flagToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'NetworkIssue',
        }),
      );
      done();
    },         0);
  });

  it('flag notification when it has server issue', (done: jest.DoneCallback) => {
    MockFunc.testFlag('server');
    setTimeout(() => {
      expect(MockFunc.mockCallback).toHaveBeenCalled();
      done();
    },         0);
  });

  it('flash notification when it has other kinds of issue(not network or server issue)', () => {
    expect(() => MockFunc.testFlag('other')).toThrow(new Error());
  });
});
