import { NetworkRequestExecutor } from '../NetworkRequestExecutor';
import { getFakeRequest, getFakeClient, getFakeResponse } from './utils';
import {
  NETWORK_REQUEST_EXECUTOR_STATUS,
  NETWORK_FAIL_TEXT,
  RESPONSE_STATUS_CODE,
  NETWORK_HANDLE_TYPE,
  IResponse,
} from '../network';
import { SERVER_ERROR_CODE } from '../Constants';
import { HttpResponseBuilder } from '../client';

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
      response.status = RESPONSE_STATUS_CODE.BAD_GATEWAY;
      response.statusText = NETWORK_FAIL_TEXT.BAD_GATEWAY;
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
      response.status = RESPONSE_STATUS_CODE.SERVICE_UNAVAILABLE;
      response.statusText = NETWORK_FAIL_TEXT.SERVICE_UNAVAILABLE;
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
      response.statusText = NETWORK_FAIL_TEXT.TIME_OUT;
      const spy = jest.spyOn(networkExecutor, '_retry');
      networkExecutor.onFailure(response);
      expect(spy).toBeCalled();
    });

    it('should remove oauth token when token is invalid', () => {
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
      const oauthFailedResponse = getFakeResponse();
      oauthFailedResponse.status = RESPONSE_STATUS_CODE.UNAUTHORIZED;
      oauthFailedResponse.statusText = NETWORK_FAIL_TEXT.UNAUTHORIZED;
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

  describe('getRequest', () => {
    it('should return the request', () => {
      expect(networkExecutor.getRequest()).toEqual(getFakeRequest());
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
      expect(networkExecutor.isPause()).toBeTruthy();
    });

    it('should false when status not equal pause', () => {
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
      expect(networkExecutor.isPause()).toBeFalsy();
    });
  });

  describe('_isCompletion', () => {
    it('should true when status is completion', () => {
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
      expect(networkExecutor['_isCompletion']()).toBeTruthy();
    });

    it('should false when status is not completion', () => {
      networkExecutor.status = NETWORK_REQUEST_EXECUTOR_STATUS.PAUSE;
      expect(networkExecutor['_isCompletion']()).toBeFalsy();
    });
  });

  describe('_performNetworkRequest', () => {
    it('should call client.request', () => {
      networkExecutor.client.request = jest.fn();
      networkExecutor['_performNetworkRequest']();
      expect(networkExecutor.client.request).toBeCalledWith(
        getFakeRequest(),
        networkExecutor,
      );
    });

    it('should decorate request when_requestDecoration is valid', () => {
      networkExecutor.client.request = jest.fn();
      networkExecutor['_requestDecoration'] = {
        decorate: jest.fn(),
      };
      networkExecutor['_performNetworkRequest']();
      expect(networkExecutor.client.request).toBeCalledWith(
        getFakeRequest(),
        networkExecutor,
      );
      expect(networkExecutor['_requestDecoration'].decorate).toBeCalledWith(
        getFakeRequest(),
      );
    });
  });

  describe('_notifyCompletion', () => {
    it('should call listener', () => {
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
    it('should retry when retryCount > 0', () => {
      networkExecutor.retryCount = 1;
      networkExecutor.execute = jest.fn();
      networkExecutor['_retry']();
      expect(networkExecutor.execute).toBeCalled();
      expect(networkExecutor.retryCount).toEqual(0);
    });

    it('should not retry when retryCount <= 0', () => {
      networkExecutor.retryCount = 0;
      networkExecutor['_cancelClientRequest'] = jest.fn();
      networkExecutor['_callXApiResponse'] = jest.fn();
      networkExecutor['_retry']();
      expect(networkExecutor['_cancelClientRequest']).toBeCalled();
      expect(networkExecutor['_callXApiResponse']).toBeCalledWith(
        0,
        NETWORK_FAIL_TEXT.TIME_OUT,
      );
    });
  });

  describe('_cancelClientRequest', () => {
    it('should call client.cancelRequest', () => {
      networkExecutor.client.cancelRequest = jest.fn();
      networkExecutor['_cancelClientRequest']();
      expect(networkExecutor.client.cancelRequest).toBeCalledWith(
        getFakeRequest(),
      );
    });
  });

  describe('_callXApiResponseCallback', () => {
    it('should call _handle401XApiCompletionCallback when status is UNAUTHORIZED', () => {
      networkExecutor['_handle401XApiCompletionCallback'] = jest.fn();
      const mockResponse = {
        status: RESPONSE_STATUS_CODE.UNAUTHORIZED,
      } as any;
      networkExecutor['_callXApiResponseCallback'](mockResponse);
      expect(
        networkExecutor['_handle401XApiCompletionCallback'],
      ).toBeCalledWith(mockResponse);
    });

    it('should call _handle502XApiCompletionCallback when status is BAD_GATEWAY', () => {
      networkExecutor['_handle502XApiCompletionCallback'] = jest.fn();
      networkExecutor['_callXApiCompletionCallback'] = jest.fn();
      const mockResponse = {
        status: RESPONSE_STATUS_CODE.BAD_GATEWAY,
      } as any;
      networkExecutor['_callXApiResponseCallback'](mockResponse);
      expect(
        networkExecutor['_handle502XApiCompletionCallback'],
      ).toBeCalledWith(mockResponse);
      expect(networkExecutor['_callXApiCompletionCallback']).toBeCalledWith(
        mockResponse,
      );
    });

    it('should call _handle503XApiCompletionCallback when status is SERVICE_UNAVAILABLE', () => {
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
        expect(
          networkExecutor.canRetry(
            HttpResponseBuilder.builder.setStatus(status).build(),
          ),
        ).toEqual(result);
      },
    );
  });
});
