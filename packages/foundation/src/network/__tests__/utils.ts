import {
  IRequestDecoration,
  IRequest,
  NETWORK_VIA,
  ITokenHandler,
  IToken
} from '../network';
// NetworkRequestBuilder,
// Token,
// NetworkRequestHandler,
// OAuthTokenManager,
// OAuthTokenHandler;
import { NetworkRequestExecutor } from '../NetworkRequestExecutor';
import RequestTask from '../RequestTask';
import BaseClient from '../client/BaseClient';
import Response from '../client/http/Response';
import NetworkRequestConsumer from '../NetworkRequestConsumer';
import NetworkRequestSurvivalMode from '../NetworkRequestSurvivalMode';
import AbstractHandleType from '../AbstractHandleType';
import NetworkRequestBuilder from '../client/NetworkRequestBuilder';
import Token from '../Token';
import OAuthTokenManager from '../OAuthTokenManager';
import NetworkRequestHandler from '../NetworkRequestHandler';
import OAuthTokenHandler from '../OAuthTokenHandler';
const fakeHandleType = new class extends AbstractHandleType {}();

const getFakeRequest = () => {
  const request = new NetworkRequestBuilder()
    .setHandlerType(fakeHandleType)
    .build();
  return request;
};

const getFakeResponse = () => {
  const response = Response.builder.build();
  return response;
};

const getFakeToken = () => {
  return new Token('');
};

const getFakeTokenManager = () => {
  return new OAuthTokenManager();
};

const getFakeHandler = () => {
  return new NetworkRequestHandler(getFakeTokenManager(), fakeHandleType);
};

const getFakeClient = () => {
  return new class extends BaseClient {}();
};

const getFakeExecutor = () => {
  return new NetworkRequestExecutor(getFakeRequest(), getFakeClient());
};

const getFakeDecoration = () => {
  return new class implements IRequestDecoration {
    decorate(request: IRequest) {
      jest.fn();
    }
  }();
};

const getFakeConsumer = () => {
  return new NetworkRequestConsumer(
    getFakeHandler(),
    getFakeClient(),
    10,
    NETWORK_VIA.HTTP,
    getFakeHandler(),
    null
  );
};

const getFakeTask = () => {
  return new RequestTask(getFakeRequest());
};

const getFakeSurvivalMode = () => {
  return new NetworkRequestSurvivalMode();
};

const getFakeTokenHandler = () => {
  return new class implements ITokenHandler {
    isAccessTokenRefreshable() {
      return fakeHandleType.tokenRefreshable;
    }
    doRefreshToken(token: IToken) {
      return fakeHandleType.doRefreshToken(token);
    }
    willAccessTokenExpired() {
      return fakeHandleType.tokenExpirable;
    }
  }();
};

const getFakeOAuthTokenHandler = () => {
  return new OAuthTokenHandler(fakeHandleType, getFakeTokenHandler());
};

export {
  fakeHandleType,
  getFakeRequest,
  getFakeResponse,
  getFakeToken,
  getFakeHandler,
  getFakeExecutor,
  getFakeClient,
  getFakeDecoration,
  getFakeTokenManager,
  getFakeConsumer,
  getFakeTask,
  getFakeSurvivalMode,
  getFakeTokenHandler,
  getFakeOAuthTokenHandler
};
