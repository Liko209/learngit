import {
  IRequestDecoration,
  IRequest,
  NETWORK_VIA,
  ITokenHandler,
  IToken,
  INetworkRequestProducer,
  IResponseListener,
} from '../network';
import { NetworkRequestExecutor } from '../NetworkRequestExecutor';
import RequestTask from '../RequestTask';
import BaseClient from '../client/BaseClient';
import { HttpResponseBuilder } from '../client/http';
import { AbstractConsumer } from '../consumer/AbstractConsumer';
import NetworkRequestSurvivalMode from '../NetworkRequestSurvivalMode';
import AbstractHandleType from '../AbstractHandleType';
import NetworkRequestBuilder from '../client/NetworkRequestBuilder';
import Token from '../Token';
import OAuthTokenManager from '../OAuthTokenManager';
import NetworkRequestHandler from '../NetworkRequestHandler';
import OAuthTokenHandler from '../OAuthTokenHandler';
import NetworkRequestDecorator from '../NetworkRequestDecorator';

class FakeConsumer extends AbstractConsumer {
  constructor(
    producer: INetworkRequestProducer,
    responseListener: IResponseListener,
    client: BaseClient,
    networkRequestDecorator: NetworkRequestDecorator,
    via: NETWORK_VIA,
  ) {
    super(producer, responseListener, client, networkRequestDecorator, via);
  }

  canHandleRequest() {
    return false;
  }
}

const fakeHandleType = new class extends AbstractHandleType {}();

const getFakeRequest = () => {
  const request = new NetworkRequestBuilder().setHandlerType(fakeHandleType);
  return request;
};

const getFakeResponse = () => {
  const response = HttpResponseBuilder.builder.build();
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
  return new FakeConsumer(
    getFakeHandler(),
    getFakeHandler(),
    getFakeClient(),
    null,
    NETWORK_VIA.HTTP,
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
  getFakeOAuthTokenHandler,
};
