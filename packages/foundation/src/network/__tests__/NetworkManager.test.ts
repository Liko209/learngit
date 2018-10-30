import NetworkManager from '../NetworkManager';
import NetworkRequestSurvivalMode from '../NetworkRequestSurvivalMode';
import { IRequestDecoration, IRequest } from '../network';
jest.mock('../NetworkRequestSurvivalMode');

import {
  fakeHandleType,
  getFakeRequest,
  getFakeToken,
  getFakeHandler,
} from './utils';
let networkManager: NetworkManager;
const initManagerWithHandlerType = () => {
  networkManager.initNetworkRequestBaseHandler(
    fakeHandleType,
    true,
    new class implements IRequestDecoration {
      decorate(request: IRequest) {
        jest.fn();
      }
    }(),
  );
};
describe('NetworkManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    networkManager = NetworkManager.defaultInstance;
  });
  describe('initNetworkRequestBaseHandler', () => {
    it('should have initiated request handler', () => {
      const spy = jest.spyOn(networkManager, 'addRequestConsumer');
      initManagerWithHandlerType();
      expect(
        networkManager.networkRequestHandler(fakeHandleType),
      ).not.toBeNull();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(NetworkRequestSurvivalMode).toHaveBeenCalledTimes(1);
    });
  });

  describe('addApiRequest', () => {
    it('should add request to specific handler', () => {
      const request = getFakeRequest();
      const spy = jest.spyOn(
        networkManager.networkRequestHandler(fakeHandleType),
        'addApiRequest',
      );
      networkManager.addApiRequest(request);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('should pause all handlers', () => {
      const spys = [];
      networkManager.handlers.forEach(handler => {
        const spy = jest.spyOn(handler, 'pause');
        return spys.push(spy);
      });
      networkManager.pause();
      spys.forEach(spy => {
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('resume', () => {
    it('should resume all handlers', () => {
      const spys = [];
      networkManager.handlers.forEach(handler => {
        const spy = jest.spyOn(handler, 'resume');
        return spys.push(spy);
      });
      networkManager.resume();
      spys.forEach(spy => {
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('cancelAll', () => {
    it('should cancel all handlers', () => {
      const spys = [];
      networkManager.handlers.forEach(handler => {
        const spy = jest.spyOn(handler, 'cancelAll');
        return spys.push(spy);
      });
      networkManager.cancelAll();
      spys.forEach(spy => {
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('cancelRequest', () => {
    it('should cancel specific request', () => {
      const request = getFakeRequest();
      const spy = jest.spyOn(
        networkManager.networkRequestHandler(fakeHandleType),
        'cancelRequest',
      );
      networkManager.cancelRequest(request);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getTokenManager', () => {
    it('should return tokenManager', () => {
      expect(networkManager.getTokenManager()).not.toBeNull();
      expect(
        networkManager.getTokenManager() === networkManager.tokenManager,
      ).toBeTruthy();
    });
  });

  describe('setOAuthToken', () => {
    it('should set token to tokenManager', () => {
      const spy = jest.spyOn(networkManager.tokenManager, 'setOAuthToken');
      networkManager.setOAuthToken(getFakeToken(), fakeHandleType);
      expect(spy).toBeCalled();
    });
  });

  describe('clearToken', () => {
    it('should clear tokenManager', () => {
      const spy = jest.spyOn(networkManager.tokenManager, 'clearOAuthToken');
      networkManager.clearToken();
      expect(spy).toBeCalled();
    });
  });

  describe('addNetworkRequestHandler', () => {
    it('should add handler to handlers map', () => {
      const spy = jest.spyOn(networkManager.handlers, 'set');
      networkManager.addNetworkRequestHandler(getFakeHandler());
      expect(spy).toBeCalled();
    });
  });

  describe('networkRequestHandler', () => {
    it('should get particular type handler', () => {
      expect(
        networkManager.networkRequestHandler(fakeHandleType) ===
          networkManager.handlers.get(fakeHandleType),
      ).toBeTruthy();
    });
  });
});
