import { NetworkRequestExecutor } from '../NetworkRequestExecutor';
import { getFakeRequest, getFakeClient, getFakeResponse } from './utils';
import {
  NETWORK_REQUEST_EXECUTOR_STATUS,
  NETWORK_FAIL_TYPE,
  HTTP_STATUS_CODE,
} from '../network';

const networkExecutor = new NetworkRequestExecutor(
  getFakeRequest(),
  getFakeClient(),
);

describe('NetworkRequestExecutor', () => {
  describe('onSuccess', () => {
    it('should call callback', () => {
      const spy = jest.spyOn(networkExecutor, '_callXApiResponseCallback');
      networkExecutor.onSuccess(getFakeResponse());
      expect(spy).toBeCalled();
      expect(networkExecutor.status).toEqual(
        NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION,
      );
    });
  });

  describe('onFailure', () => {
    it('should call callback', () => {
      networkExecutor.retryCount = 0;
      const spy = jest.spyOn(networkExecutor, '_callXApiResponseCallback');
      networkExecutor.onFailure(getFakeResponse());
      expect(spy).toBeCalled();
      expect(networkExecutor.status).toEqual(
        NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION,
      );
    });
    it('should retry when retrycount>0', () => {
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
      networkExecutor.retryCount = 3;
      const response = getFakeResponse();
      response.statusText = NETWORK_FAIL_TYPE.TIME_OUT;
      const spy = jest.spyOn(networkExecutor, '_retry');
      networkExecutor.onFailure(response);
      expect(spy).toBeCalled();
    });

    it('should remove oauth token when token is invalid', () => {
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
      const oauthFailedResponse = getFakeResponse();
      oauthFailedResponse.status = HTTP_STATUS_CODE.UNAUTHORIZED;
      oauthFailedResponse.statusText = NETWORK_FAIL_TYPE.UNAUTHORIZED;
      const request = getFakeRequest();
      request.headers = {
        Authorization: '111',
      };
      const responseListener = {
        onAccessTokenInvalid: jest.fn(),
      };
      networkExecutor.request = request;
      networkExecutor.responseListener = responseListener;
      networkExecutor.onFailure(oauthFailedResponse);

      expect(responseListener.onAccessTokenInvalid).toBeCalled();
      expect(request.headers.Authorization).toBeUndefined();
    });
  });

  describe('execute', () => {
    it('should perform request', () => {
      const spy = jest.spyOn(networkExecutor, '_performNetworkRequest');
      networkExecutor.execute();
      expect(spy).toBeCalled();
      expect(networkExecutor.status).toEqual(
        NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING,
      );
    });

    it('should complete', () => {
      networkExecutor.client.isNetworkReachable = () => false;
      const spy = jest.spyOn(networkExecutor, '_callXApiResponse');
      networkExecutor.execute();
      expect(spy).toBeCalled();
      expect(networkExecutor.status).toEqual(
        NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION,
      );
    });
  });

  describe('cancel', () => {
    it('should call cancel', () => {
      networkExecutor.isCompletion = () => false;
      // const spy = jest.spyOn(networkExecutor, '_cancelClientRequest');
      const spy1 = jest.spyOn(networkExecutor, '_callXApiResponse');
      networkExecutor.cancel();
      // expect(spy).toBeCalled();
      expect(spy1).toBeCalled();
      expect(networkExecutor.status).toEqual(
        NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION,
      );
    });
  });

  describe('isPause', () => {
    it('should true when status equal pause', () => {
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.PAUSE;
      expect(networkExecutor.isPause()).toEqual(true);
    });

    it('should true when status not equal pause', () => {
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
      expect(networkExecutor.isPause()).not.toEqual(true);
    });
  });
});
