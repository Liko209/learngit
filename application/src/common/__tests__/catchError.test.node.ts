/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-02 14:15:17
 * Copyright © RingCentral. All rights reserved.
 */
import { Notification } from '@/containers/Notification';
import {
  ERROR_CODES_NETWORK,
  JNetworkError,
  JServerError,
  ERROR_CODES_SERVER,
} from 'sdk/error';
import { catchError, ERROR_TYPES, getErrorType } from '../catchError';

jest.mock('@/containers/Notification');

type functionResult = 'network' | 'server' | 'other' | 'success';

class MockFunc {
  static mockCallback = jest.fn((error: Error, ctx: any) => ({ error, ctx }));
  @catchError([
    {
      condition(error: any) {
        return error instanceof JNetworkError;
      },
      action: MockFunc.mockCallback,
    },
  ])
  globalFunc = async (type: functionResult) => {
    if (type === 'success') {
      await Promise.resolve('success');
      return true;
    }
    let error = new Error();
    if (type === 'network') {
      error = new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
    }
    if (type === 'server') {
      error = new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
    }
    await Promise.reject(error);
    return false;
  };

  @catchError.flash({
    network: MockFunc.mockCallback,
    server: 'ServerIssue',
  })
  static async asyncFunc(type: functionResult) {
    if (type === 'success') {
      await Promise.resolve('success');
      return true;
    }
    let error = new Error();
    if (type === 'network') {
      error = new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
    }
    if (type === 'server') {
      error = new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
    }
    await Promise.reject(error);
    return false;
  }

  @catchError.flash({
    isDebounce: true,
    network: 'networkIssue',
    server: 'ServerIssue',
  })
  static async asyncDebounceFunc(type: functionResult) {
    if (type === 'success') {
      await Promise.resolve('success');
      return true;
    }
    let error = new Error();
    if (type === 'network') {
      error = new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
    }
    if (type === 'server') {
      error = new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
    }
    await Promise.reject(error);
    return false;
  }

  @catchError.flash({
    network: MockFunc.mockCallback,
    server: 'ServerIssue',
  })
  returnPromiseFunc = (type: functionResult) => {
    if (type === 'success') {
      return Promise.resolve('success');
    }
    let error = new Error();
    if (type === 'network') {
      error = new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
    }
    if (type === 'server') {
      error = new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
    }
    return Promise.reject(error);
  };

  @catchError.flag({
    network: 'NetworkIssue',
    server: MockFunc.mockCallback,
  })
  static syncFunc(type: functionResult) {
    if (type === 'success') {
      return true;
    }
    if (type === 'network') {
      throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
    }
    if (type === 'server') {
      throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
    }
    throw new Error();
  }
}

describe('catchError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('when error matches condition, it should execute action function', async (done: jest.DoneCallback) => {
    const mockObj = new MockFunc();
    await mockObj.globalFunc('network');
    expect(MockFunc.mockCallback).toHaveBeenCalled();
    done();
  });

  it("when error doesn't match condition, it should catch error", async (done: jest.DoneCallback) => {
    const mockObj = new MockFunc();
    await expect(mockObj.globalFunc('server')).rejects.toThrow(
      new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL'),
    );
    done();
  });

  it('success scenario', async (done: jest.DoneCallback) => {
    const mockObj = new MockFunc();
    await expect(mockObj.globalFunc('success')).resolves.toBe(true);
    done();
  });
});

describe('catchError.flash', () => {
  describe('decorate a simple asynchronous func', () => {
    beforeEach(() => {
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      jest.clearAllMocks();
    });

    it('flash notification when it has network issue', async (done: jest.DoneCallback) => {
      await MockFunc.asyncFunc('network');
      expect(MockFunc.mockCallback).toHaveBeenCalled();
      done();
    });

    it('flash notification when it has server issue', async (done: jest.DoneCallback) => {
      await MockFunc.asyncFunc('server');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ServerIssue',
        }),
      );
      done();
    });

    it('flash notification once when it is not debounce error handle', async (done: jest.DoneCallback) => {
      await MockFunc.asyncFunc('server');
      await MockFunc.asyncFunc('server');
      expect(Notification.flashToast).toHaveBeenCalledTimes(2);
      done();
    });

    it('flash notification once when it is debounce error handle', async (done: jest.DoneCallback) => {
      await MockFunc.asyncDebounceFunc('server');
      await MockFunc.asyncDebounceFunc('server');
      expect(Notification.flashToast).toHaveBeenCalledTimes(1);
      done();
    });

    it('throw error when it has other kinds of issue(not network or server issue)', async (done: jest.DoneCallback) => {
      await expect(MockFunc.asyncFunc('other')).rejects.toThrow(new Error());
      done();
    });

    it('success scenario', async (done: jest.DoneCallback) => {
      await expect(MockFunc.asyncFunc('success')).resolves.toBe(true);
      done();
    });
  });

  describe('decorate a synchronous func which return a Promise', () => {
    beforeEach(() => {
      Notification.flashToast = jest.fn().mockImplementationOnce(() => {});
      jest.clearAllMocks();
    });

    it('flash notification when it has network issue', async (done: jest.DoneCallback) => {
      const mockObj = new MockFunc();
      await mockObj.returnPromiseFunc('network');
      expect(MockFunc.mockCallback).toHaveBeenCalled();
      done();
    });

    it('flash notification when it has server issue', async (done: jest.DoneCallback) => {
      const mockObj = new MockFunc();
      await mockObj.returnPromiseFunc('server');
      expect(Notification.flashToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'ServerIssue',
        }),
      );
      done();
    });

    it('throw error when it has other kinds of issue(not network or server issue)', async (done: jest.DoneCallback) => {
      const mockObj = new MockFunc();
      await expect(mockObj.returnPromiseFunc('other')).rejects.toThrow(
        new Error(),
      );
      done();
    });

    it('success scenario', async (done: jest.DoneCallback) => {
      const mockObj = new MockFunc();
      await expect(mockObj.returnPromiseFunc('success')).resolves.toBe(
        'success',
      );
      done();
    });
  });
});

describe('catchError.flag: decorate a simple synchronous func', () => {
  beforeEach(() => {
    Notification.flagToast = jest.fn().mockImplementationOnce(() => {});
    jest.clearAllMocks();
  });

  it('flag notification when it has network issue', () => {
    MockFunc.syncFunc('network');
    expect(Notification.flagToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'NetworkIssue',
      }),
    );
  });

  it('flag notification when it has server issue', () => {
    MockFunc.syncFunc('server');
    expect(MockFunc.mockCallback).toHaveBeenCalled();
  });

  it('flash notification when it has other kinds of issue(not network or server issue)', () => {
    expect(() => MockFunc.syncFunc('other')).toThrow(new Error());
  });

  it('success scenario', () => {
    expect(MockFunc.syncFunc('success')).toBe(true);
  });
});

describe('getErrorType', () => {
  it('getErrorType: UNKNOWN', () => {
    expect(getErrorType(new Error('UNKNOWN'))).toEqual(ERROR_TYPES.UNKNOWN);
  });
  it('getErrorType: NETWORK', () => {
    expect(
      getErrorType(
        new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK'),
      ),
    ).toEqual(ERROR_TYPES.NETWORK);
  });
  it('getErrorType: NETWORK LOCAL TIMEOUT', () => {
    expect(
      getErrorType(
        new JNetworkError(ERROR_CODES_NETWORK.LOCAL_TIMEOUT, 'LOCAL_TIMEOUT'),
      ),
    ).toEqual(ERROR_TYPES.NETWORK);
  });
  it('getErrorType: NOT_AUTHORIZED', () => {
    expect(
      getErrorType(
        new JServerError(ERROR_CODES_SERVER.NOT_AUTHORIZED, 'NOT_AUTHORIZED'),
      ),
    ).toEqual(ERROR_TYPES.NOT_AUTHORIZED);
  });
  it('getErrorType: BACKEND', () => {
    expect(
      getErrorType(new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL')),
    ).toEqual(ERROR_TYPES.BACKEND);
  });
});
