import { NetworkRequestExecutor } from '../NetworkRequestExecutor';
import { getFakeRequest, getFakeClient, getFakeResponse } from './utils';
import {
  NETWORK_REQUEST_EXECUTOR_STATUS,
  NETWORK_FAIL_TYPE,
  HTTP_STATUS_CODE,
  NETWORK_HANDLE_TYPE,
  IResponse,
} from '../network';
import { SERVER_ERROR_CODE } from '../Constants';

let networkExecutor: NetworkRequestExecutor;

describe('NetworkRequestExecutor', () => {
  beforeEach(() => {
    networkExecutor = new NetworkRequestExecutor(
      getFakeRequest(),
      getFakeClient(),
    );
    jest.clearAllMocks();
  });

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

    it('Should call callback when getting response with error code 502', () => {
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
      networkExecutor.retryCount = 0;
      const spyApiCB = jest.spyOn(
        networkExecutor,
        '_callXApiCompletionCallback',
      );
      const spy502CB = jest
        .spyOn(networkExecutor, '_handle502XApiCompletionCallback')
        .mockImplementation(() => {});
      const response = getFakeResponse();
      response.status = HTTP_STATUS_CODE.BAD_GATEWAY;
      response.statusText = NETWORK_FAIL_TYPE.BAD_GATEWAY;
      networkExecutor.onFailure(response);
      expect(spy502CB).toBeCalled();
      expect(spyApiCB).toBeCalled();
      expect(networkExecutor.status).toEqual(
        NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION,
      );
    });

    it('Should call callback when getting response with error code 503', () => {
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
      networkExecutor.retryCount = 0;
      const spyApiCB = jest.spyOn(
        networkExecutor,
        '_callXApiCompletionCallback',
      );
      const spy503CB = jest
        .spyOn(networkExecutor, '_handle503XApiCompletionCallback')
        .mockImplementation(() => {});
      const response = getFakeResponse();
      response.status = HTTP_STATUS_CODE.SERVICE_UNAVAILABLE;
      response.statusText = NETWORK_FAIL_TYPE.SERVICE_UNAVAILABLE;
      networkExecutor.onFailure(response);
      expect(spy503CB).toBeCalled();
      expect(spyApiCB).toBeCalled();
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

  describe('_handle503XApiCompletionCallback()', () => {
    it('should do nothing when handle type is not ringcentral', () => {
      const response = {
        request: {
          handlerType: {
            name: NETWORK_HANDLE_TYPE.GLIP,
          },
        },
      };
      jest.spyOn(networkExecutor, '_isCMN211Error');
      networkExecutor['_handle503XApiCompletionCallback'](
        response as IResponse,
      );
      expect(networkExecutor['_isCMN211Error']).not.toBeCalled();
    });

    it('should enter survival mode when is CMN-211 error', () => {
      const response = {
        request: {
          handlerType: {
            name: NETWORK_HANDLE_TYPE.RINGCENTRAL,
          },
        },
        data: 'data',
      };
      jest.spyOn(networkExecutor, '_isCMN211Error').mockReturnValueOnce(true);
      networkExecutor.responseListener = {
        onSurvivalModeDetected: jest.fn(),
      };
      networkExecutor['_handle503XApiCompletionCallback'](
        response as IResponse,
      );
      expect(networkExecutor['_isCMN211Error']).toBeCalled();
      expect(
        networkExecutor.responseListener.onSurvivalModeDetected,
      ).toBeCalled();
    });
  });

  describe('_isCMN211Error()', () => {
    it('should call _isServerErrorCodeMatched', () => {
      jest.spyOn(networkExecutor, '_isServerErrorCodeMatched');
      const data = 'data';
      networkExecutor['_isCMN211Error'](data);
      expect(networkExecutor['_isServerErrorCodeMatched']).toBeCalledWith(
        data,
        SERVER_ERROR_CODE.CMN211,
      );
    });
  });

  describe('_isServerErrorCodeMatched', () => {
    it('should return true when data errorCode is matched', () => {
      const err = 'someError';
      const data = { errorCode: err };
      expect(
        networkExecutor['_isServerErrorCodeMatched'](data, err),
      ).toBeTruthy();
    });

    it('should return true when errors errorCode is matched', () => {
      const err = 'someError';
      const data = { errorCode: 'other', errors: [{ errorCode: err }] };
      expect(
        networkExecutor['_isServerErrorCodeMatched'](data, err),
      ).toBeTruthy();
    });

    it('should return false when errorCode is not matched', () => {
      const err = 'someError';
      const data = { errorCode: 'other', errors: [{ errorCode: 'other' }] };
      expect(
        networkExecutor['_isServerErrorCodeMatched'](data, err),
      ).toBeFalsy();
    });
  });
});
