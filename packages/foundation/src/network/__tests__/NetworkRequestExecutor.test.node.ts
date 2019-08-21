import { NetworkRequestExecutor } from '../NetworkRequestExecutor';
import { getFakeRequest, getFakeClient, getFakeResponse, sleep } from './utils';
import {
  NETWORK_REQUEST_EXECUTOR_STATUS,
  NETWORK_FAIL_TEXT,
  RESPONSE_STATUS_CODE,
  NETWORK_HANDLE_TYPE,
  IResponse,
} from '../network';
import { SERVER_ERROR_CODE } from '../Constants';
import { HttpResponseBuilder, NetworkRequestBuilder } from '../client';

function setupExecutor(request?: NetworkRequestBuilder) {
  return new NetworkRequestExecutor(
    request ? request : getFakeRequest(),
    getFakeClient(),
  );
}

describe('NetworkRequestExecutor', () => {
  const fakeResponse = getFakeResponse();
  beforeEach(() => {
    jest.clearAllMocks();
    fakeResponse.request = getFakeRequest();
  });

  describe('onSuccess', () => {
    it('should call callback', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      const spy = jest.spyOn(networkExecutor, '_callXApiResponseCallback');
      networkExecutor.onSuccess(fakeResponse);
      expect(spy).toHaveBeenCalled();
      expect(networkExecutor.status).toEqual(
        NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION,
      );
    });
  });

  describe('onFailure', () => {
    it('should call callback', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.retryCount = 0;
      const spy = jest.spyOn(networkExecutor, '_callXApiResponseCallback');
      networkExecutor.onFailure(fakeResponse);
      expect(spy).toHaveBeenCalled();
      expect(networkExecutor.status).toEqual(
        NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION,
      );
    });

    it('Should call callback when getting response with error code 502', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
      networkExecutor.retryCount = 0;
      const spyApiCB = jest.spyOn(
        networkExecutor,
        '_callXApiCompletionCallback',
      );
      const spy502CB = jest
        .spyOn(networkExecutor, '_handle502XApiCompletionCallback')
        .mockImplementation(() => {});
      fakeResponse.status = RESPONSE_STATUS_CODE.BAD_GATEWAY;
      fakeResponse.statusText = NETWORK_FAIL_TEXT.BAD_GATEWAY;
      networkExecutor.onFailure(fakeResponse);
      expect(spy502CB).toHaveBeenCalled();
      expect(spyApiCB).toHaveBeenCalled();
      expect(networkExecutor.status).toEqual(
        NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION,
      );
    });

    it('Should call callback when getting response with error code 503', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
      networkExecutor.retryCount = 0;
      const spyApiCB = jest.spyOn(
        networkExecutor,
        '_callXApiCompletionCallback',
      );
      const spy503CB = jest
        .spyOn(networkExecutor, '_handle503XApiCompletionCallback')
        .mockImplementation(() => {});
      fakeResponse.status = RESPONSE_STATUS_CODE.SERVICE_UNAVAILABLE;
      fakeResponse.statusText = NETWORK_FAIL_TEXT.SERVICE_UNAVAILABLE;
      networkExecutor.onFailure(fakeResponse);
      expect(spy503CB).toHaveBeenCalled();
      expect(spyApiCB).toHaveBeenCalled();
      expect(networkExecutor.status).toEqual(
        NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION,
      );
    });

    it('should retry when retrycount>0', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
      networkExecutor.retryCount = 3;
      networkExecutor.retryCounter = 0;
      fakeResponse.status = RESPONSE_STATUS_CODE.BAD_GATEWAY;
      const spy = jest.spyOn(networkExecutor, '_retry');
      networkExecutor.onFailure(fakeResponse);
      expect(spy).toHaveBeenCalled();
      networkExecutor.retryStrategy.cancel();
    });

    it('should retry when receive network error and ignoreNetwork is true', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.request.ignoreNetwork = true;
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
      networkExecutor.retryCount = 3;
      networkExecutor.retryCounter = 0;
      fakeResponse.status = RESPONSE_STATUS_CODE.NETWORK_ERROR;
      const spy = jest.spyOn(networkExecutor, '_retry');
      networkExecutor.onFailure(fakeResponse);
      expect(spy).toHaveBeenCalled();
      networkExecutor.retryStrategy.cancel();
    });
    /*
    it('should remove oauth token when token is invalid', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
      fakeResponse.status = RESPONSE_STATUS_CODE.UNAUTHORIZED;
      fakeResponse.statusText = NETWORK_FAIL_TEXT.UNAUTHORIZED;
      const request = getFakeRequest();
      request.headers = {
        Authorization: '111',
      };
      const responseListener = {
        onAccessTokenInvalid: jest.fn(),
      };
      networkExecutor.request = request;
      networkExecutor.responseListener = responseListener;
      networkExecutor.onFailure(fakeResponse);

      expect(responseListener.onAccessTokenInvalid).toHaveBeenCalled();
      expect(request.headers.Authorization).toBeUndefined();
    });
    */
  });
  /*
  describe('getRequest', () => {
    it('should return the request', () => {
      const request = getFakeRequest();
      const networkExecutor: NetworkRequestExecutor = setupExecutor(request);
      expect(networkExecutor.getRequest()).toEqual(request);
    });
  });

  describe('execute', () => {
    it('should perform request', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      const spy = jest.spyOn(networkExecutor, '_performNetworkRequest');
      networkExecutor.execute();
      expect(spy).toBeCalled();
      expect(networkExecutor.status).toEqual(
        NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING,
      );
    });

    it('should complete', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
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
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
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
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.PAUSE;
      expect(networkExecutor.isPause()).toBeTruthy();
    });

    it('should false when status not equal pause', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
      expect(networkExecutor.isPause()).toBeFalsy();
    });
  });

  describe('_isCompletion', () => {
    it('should true when status is completion', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
      expect(networkExecutor['_isCompletion']()).toBeTruthy();
    });

    it('should false when status is not completion', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.PAUSE;
      expect(networkExecutor['_isCompletion']()).toBeFalsy();
    });
  });

  describe('_performNetworkRequest', () => {
    it('should call client.request', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.client.request = jest.fn();
      networkExecutor['_performNetworkRequest']();
      networkExecutor['request'].startTime = 0;
      const fakeRequest = getFakeRequest();
      fakeRequest.startTime = 0;
      expect(networkExecutor.client.request).toBeCalledWith(
        fakeRequest,
        networkExecutor,
      );
    });

    it('should _callXApiResponse when oauth token expired', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.client.request = jest.fn();
      networkExecutor['request'].startTime = 0;
      networkExecutor['_requestDecoration'] = {
        decorate: jest.fn().mockReturnValue(false),
      } as any;
      networkExecutor['_callXApiResponse'] = jest.fn();
      const fakeRequest = getFakeRequest();
      fakeRequest.startTime = 0;

      networkExecutor['_performNetworkRequest']();
      expect(networkExecutor['_callXApiResponse']).toBeCalledWith(
        RESPONSE_STATUS_CODE.UNAUTHORIZED,
        NETWORK_FAIL_TEXT.UNAUTHORIZED,
      );
      expect(networkExecutor.client.request).not.toBeCalled();
    });

    it('should decorate request when_requestDecoration is valid', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.client.request = jest.fn();
      networkExecutor['_requestDecoration'] = {
        decorate: jest.fn().mockReturnValue(true),
      };
      networkExecutor['_performNetworkRequest']();
      networkExecutor['request'].startTime = 0;
      const fakeRequest = getFakeRequest();
      fakeRequest.startTime = 0;
      expect(networkExecutor.client.request).toBeCalledWith(
        fakeRequest,
        networkExecutor,
      );
      expect(networkExecutor['_requestDecoration'].decorate).toBeCalledWith(
        fakeRequest,
      );
    });
  });

  describe('_notifyCompletion', () => {
    it('should call listener', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.listener = {
        onConsumeFinished: jest.fn(),
      } as any;
      networkExecutor['_notifyCompletion']();
      expect(networkExecutor.listener!.onConsumeFinished).toBeCalledWith(
        networkExecutor,
      );
    });
  });

  describe('_retry', () => {
    it('should retry when retryCount > 0', async () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.retryCount = 1;
      networkExecutor.execute = jest.fn();
      networkExecutor.retryStrategy = (doRetry, retryCounter) => {
        doRetry();
      };
      jest.spyOn(networkExecutor, 'canRetry').mockReturnValue(true);
      jest.spyOn(networkExecutor, '_isCompletion').mockReturnValue(false);
      await sleep(0);
      const mockErrorResponse = { status: 500, statusText: '' } as IResponse;
      networkExecutor['onFailure'](mockErrorResponse);
      expect(networkExecutor.execute).toBeCalled();
      expect(networkExecutor.retryCount).toEqual(1);
      expect(networkExecutor.retryCounter).toEqual(1);
    });

    it('should not retry when retryCount <= 0', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.retryCount = 0;
      networkExecutor['_cancelClientRequest'] = jest.fn();
      networkExecutor['_callXApiResponse'] = jest.fn();
      jest.spyOn(networkExecutor, 'canRetry').mockReturnValue(true);
      jest.spyOn(networkExecutor, '_isCompletion').mockReturnValue(false);
      jest.spyOn(networkExecutor, '_callXApiResponseCallback');
      const mockErrorResponse = { status: 500, statusText: '' } as IResponse;
      mockErrorResponse.request = getFakeRequest();
      mockErrorResponse.request.startTime = 0;
      networkExecutor['onFailure'](mockErrorResponse);
      expect(networkExecutor['_callXApiResponseCallback']).toBeCalledWith(
        mockErrorResponse,
      );
    });
  });

  describe('_cancelClientRequest', () => {
    it('should call client.cancelRequest', () => {
      const request = getFakeRequest();
      const networkExecutor: NetworkRequestExecutor = setupExecutor(request);
      networkExecutor.client.cancelRequest = jest.fn();
      networkExecutor['_cancelClientRequest']();
      expect(networkExecutor.client.cancelRequest).toBeCalledWith(request);
    });
  });

  describe('_callXApiResponseCallback', () => {
    it('should call _handle401XApiCompletionCallback when status is UNAUTHORIZED', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor['_handle401XApiCompletionCallback'] = jest.fn();
      const mockResponse = {
        status: RESPONSE_STATUS_CODE.UNAUTHORIZED,
      } as any;
      networkExecutor['_callXApiResponseCallback'](mockResponse);
      expect(networkExecutor['_handle401XApiCompletionCallback']).toBeCalled();
    });

    it('should call _handle502XApiCompletionCallback when status is BAD_GATEWAY', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor['_handle502XApiCompletionCallback'] = jest.fn();
      networkExecutor['_callXApiCompletionCallback'] = jest.fn();
      const mockResponse = {
        status: RESPONSE_STATUS_CODE.BAD_GATEWAY,
      } as any;
      networkExecutor['_callXApiResponseCallback'](mockResponse);
      expect(networkExecutor['_handle502XApiCompletionCallback']).toBeCalled();
      expect(networkExecutor['_callXApiCompletionCallback']).toBeCalledWith(
        mockResponse,
      );
    });

    it('should call _handle503XApiCompletionCallback when status is SERVICE_UNAVAILABLE', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor['_handle503XApiCompletionCallback'] = jest.fn();
      networkExecutor['_callXApiCompletionCallback'] = jest.fn();
      const mockResponse = {
        status: RESPONSE_STATUS_CODE.SERVICE_UNAVAILABLE,
      } as any;
      networkExecutor['_callXApiResponseCallback'](mockResponse);
      expect(
        networkExecutor['_handle503XApiCompletionCallback'],
      ).toBeCalledWith(mockResponse);
      expect(networkExecutor['_callXApiCompletionCallback']).toBeCalledWith(
        mockResponse,
      );
    });
  });

  describe('_handle503XApiCompletionCallback()', () => {
    it('should do nothing when handle type is not ringcentral', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.handlerType = {
        name: NETWORK_HANDLE_TYPE.GLIP,
      } as any;
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
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      networkExecutor.handlerType = {
        name: NETWORK_HANDLE_TYPE.RINGCENTRAL,
      } as any;
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
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
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
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      const err = 'someError';
      const data = { errorCode: err };
      expect(
        networkExecutor['_isServerErrorCodeMatched'](data, err),
      ).toBeTruthy();
    });

    it('should return true when errors errorCode is matched', () => {
      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      const err = 'someError';
      const data = { errorCode: 'other', errors: [{ errorCode: err }] };
      expect(
        networkExecutor['_isServerErrorCodeMatched'](data, err),
      ).toBeTruthy();
    });

    it('should return false when errorCode is not matched', () => {
      const err = 'someError';
      const data = { errorCode: 'other', errors: [{ errorCode: 'other' }] };

      const networkExecutor: NetworkRequestExecutor = setupExecutor();
      expect(
        networkExecutor['_isServerErrorCodeMatched'](data, err),
      ).toBeFalsy();
    });
  });

  describe('canRetry()', () => {
    it.each`
      status                                               | result
      ${RESPONSE_STATUS_CODE.DEFAULT}                      | ${false}
      ${RESPONSE_STATUS_CODE.LOCAL_ABORTED}                | ${false}
      ${RESPONSE_STATUS_CODE.LOCAL_CANCELLED}              | ${false}
      ${RESPONSE_STATUS_CODE.LOCAL_NOT_NETWORK_CONNECTION} | ${false}
      ${RESPONSE_STATUS_CODE.LOCAL_TIME_OUT}               | ${false}
      ${RESPONSE_STATUS_CODE.NETWORK_ERROR}                | ${true}
      ${400}                                               | ${false}
      ${500}                                               | ${true}
    `(
      'should return $result when response.status = $status',
      ({ status, result }) => {
        const networkExecutor: NetworkRequestExecutor = setupExecutor();
        expect(
          networkExecutor.canRetry(
            HttpResponseBuilder.builder.setStatus(status).build(),
          ),
        ).toEqual(result);
      },
    );
  });
  */
});
