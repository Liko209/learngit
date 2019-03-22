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
import OAuthTokenManager from '../OAuthTokenManager';

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
    networkManager = new NetworkManager(new OAuthTokenManager());
    initManagerWithHandlerType();
    jest.clearAllMocks();
  });

  describe('initNetworkRequestBaseHandler', () => {
    it('should throw error when token manager is invalid', () => {
      networkManager.tokenManager = undefined;
      networkManager.handlers.clear();
      jest.spyOn(networkManager, 'addRequestConsumer');
      try {
        initManagerWithHandlerType();
      } catch (err) {
        expect(err).toEqual(Error('token manager can not be null.'));
      }
      expect(
        networkManager.networkRequestHandler(fakeHandleType.name),
      ).toBeUndefined();
      expect(networkManager.addRequestConsumer).toHaveBeenCalledTimes(0);
      expect(NetworkRequestSurvivalMode).toHaveBeenCalledTimes(0);
    });

    it('should have initiated request handler', () => {
      jest.spyOn(networkManager, 'addRequestConsumer');
      initManagerWithHandlerType();
      expect(
        networkManager.networkRequestHandler(fakeHandleType.name),
      ).toBeDefined();
      expect(networkManager.addRequestConsumer).toHaveBeenCalledTimes(2);
      expect(NetworkRequestSurvivalMode).toHaveBeenCalledTimes(1);
    });
  });

  describe('addApiRequest', () => {
    it('should add request to specific handler', () => {
      jest.spyOn(
        networkManager.networkRequestHandler(fakeHandleType.name)!,
        'addApiRequest',
      );
      // setup();
      const request = getFakeRequest();
      networkManager.addApiRequest(request);
      expect(
        networkManager.networkRequestHandler(fakeHandleType.name)!
          .addApiRequest,
      ).toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('should pause all handlers', () => {
      jest.spyOn(
        networkManager.networkRequestHandler(fakeHandleType.name)!,
        'pause',
      );
      networkManager.pause();
      expect(
        networkManager.networkRequestHandler(fakeHandleType.name)!.pause,
      ).toHaveBeenCalled();
    });
  });

  describe('resume', () => {
    it('should resume all handlers', () => {
      jest.spyOn(
        networkManager.networkRequestHandler(fakeHandleType.name)!,
        'resume',
      );
      networkManager.resume();
      expect(
        networkManager.networkRequestHandler(fakeHandleType.name)!.resume,
      ).toHaveBeenCalled();
    });
  });

  describe('cancelAll', () => {
    it('should cancel all handlers', () => {
      jest.spyOn(
        networkManager.networkRequestHandler(fakeHandleType.name)!,
        'cancelAll',
      );
      networkManager.cancelAll();
      expect(
        networkManager.networkRequestHandler(fakeHandleType.name)!.cancelAll,
      ).toHaveBeenCalled();
    });
  });

  describe('cancelRequest', () => {
    it('should cancel specific request', () => {
      const request = getFakeRequest();
      jest.spyOn(
        networkManager.networkRequestHandler(fakeHandleType.name)!,
        'cancelRequest',
      );
      networkManager.cancelRequest(request);
      expect(
        networkManager.networkRequestHandler(fakeHandleType.name)!
          .cancelRequest,
      ).toBeCalledWith(request);
    });
  });

  describe('getTokenManager', () => {
    it('should return tokenManager', () => {
      expect(networkManager.getTokenManager()).toBeDefined();
      expect(
        networkManager.getTokenManager() === networkManager.tokenManager,
      ).toBeTruthy();
    });
  });

  describe('setOAuthToken', () => {
    it('should set token to tokenManager', () => {
      jest.spyOn(networkManager.tokenManager!, 'setOAuthToken');
      const token = getFakeToken();
      networkManager.setOAuthToken(token, fakeHandleType);
      expect(networkManager.tokenManager!.setOAuthToken).toBeCalledWith(
        token,
        fakeHandleType,
      );
    });
  });

  describe('clearToken', () => {
    it('should clear tokenManager', () => {
      jest.spyOn(networkManager.tokenManager!, 'clearOAuthToken');
      networkManager.clearToken();
      expect(networkManager.tokenManager!.clearOAuthToken).toBeCalled();
    });
  });

  describe('addNetworkRequestHandler', () => {
    it('should add handler to handlers map', () => {
      jest.spyOn(networkManager.handlers, 'set');
      networkManager.addNetworkRequestHandler(getFakeHandler());
      expect(networkManager.handlers.set).toBeCalled();
    });
  });

  describe('networkRequestHandler', () => {
    it('should get particular type handler', () => {
      expect(
        networkManager.networkRequestHandler(fakeHandleType.name) ===
          networkManager.handlers.get(fakeHandleType.name),
      ).toBeTruthy();
    });
  });
});
