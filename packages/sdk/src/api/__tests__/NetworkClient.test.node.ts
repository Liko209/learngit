/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-07-23 14:46:38
 * Copyright © RingCentral. All rights reserved.
 */

// / <reference path="../../__tests__/types.d.ts" />
import {
  NetworkManager,
  NetworkRequestBuilder,
  NETWORK_VIA,
  NETWORK_METHOD,
  OAuthTokenManager,
  IRequest,
  DEFAULT_TIMEOUT_INTERVAL,
  NETWORK_FAIL_TEXT,
  BaseResponse,
  RESPONSE_STATUS_CODE,
} from 'foundation/network';
import NetworkClient from '../NetworkClient';
import { HandleByRingCentral } from '../handlers';
import { RequestHolder } from '../glip/item';

// Using manual mock to improve mock priority.
jest.mock('foundation/network', () =>
  jest.genMockFromModule<any>('foundation/network'),
);
const networkManager = new NetworkManager(new OAuthTokenManager());
const mockRequest: any = {};

const setup = () => {
  NetworkRequestBuilder.mockImplementation(() => {
    return {
      setNetworkManager: jest.fn().mockReturnThis(),
      setHost: jest.fn().mockReturnThis(),
      setHandlerType: jest.fn().mockReturnThis(),
      setPath: jest.fn().mockReturnThis(),
      setMethod: jest.fn().mockReturnThis(),
      setData: jest.fn().mockReturnThis(),
      setHeaders: jest.fn().mockReturnThis(),
      setParams: jest.fn().mockReturnThis(),
      setAuthfree: jest.fn().mockReturnThis(),
      setRequestConfig: jest.fn().mockReturnThis(),
      setRetryCount: jest.fn().mockReturnThis(),
      setIgnoreNetwork: jest.fn().mockReturnThis(),
      setPriority: jest.fn().mockReturnThis(),
      setHAPriority: jest.fn().mockReturnThis(),
      setVia: jest.fn().mockReturnThis(),
      setTimeout: jest.fn().mockReturnThis(),
      setChannel: jest.fn().mockReturnThis(),
      build: jest.fn().mockImplementation(() => mockRequest),
    };
  });
  const rcNetworkClient = new NetworkClient(
    {
      host: 'https://platform.ringcentral.com',
      handlerType: HandleByRingCentral,
      pathPrefix: '/restapi',
    },
    NETWORK_VIA.HTTP,
    networkManager,
  );

  const postRequest = {
    path: '/',
    via: NETWORK_VIA.ALL,
    data: {
      username: 'test',
    },
    params: {
      password: 'aaa',
    },
    headers: {
      tk: 'sdfsdfadfss',
    },
    method: NETWORK_METHOD.POST,
    authFree: true,
    timeout: DEFAULT_TIMEOUT_INTERVAL,
    requestConfig: {},
  };
  const getRequest = {
    method: NETWORK_METHOD.GET,
    path: '/',
    params: {
      page: 1,
      perpage: 20,
    },
  };

  const deleteRequest = {
    method: NETWORK_METHOD.GET,
    path: '/',
    params: {
      page: 1,
      perpage: 20,
    },
  };

  const putRequest = {
    method: NETWORK_METHOD.PUT,
    path: '/',
    params: {
      page: 1,
      perpage: 20,
    },
  };

  const headRequest = {
    method: NETWORK_METHOD.HEAD,
    path: '/',
    params: {
      page: 1,
      perpage: 20,
    },
  };

  const optionRequest = {
    method: NETWORK_METHOD.OPTIONS,
    path: '/',
    params: {
      page: 1,
      perpage: 20,
    },
  };

  const patchRequest = {
    method: NETWORK_METHOD.PATCH,
    path: '/',
    params: {
      page: 1,
      perpage: 20,
    },
  };

  const deleteRequest = {
    method: NETWORK_METHOD.GET,
    path: '/',
    params: {
      page: 1,
      perpage: 20,
    },
  };

  const mockQuery = {
    data: { username: 'test' },
    handlerType: HandleByRingCentral,
    headers: { tk: 'sdfsdfadfss' },
    host: 'https://platform.ringcentral.com',
    method: NETWORK_METHOD.POST,
    authFree: true,
    params: { password: 'aaa' },
    path: '/restapi/',
    requestConfig: {},
  };
  const config = {};

  return {
    rcNetworkClient,
    postRequest,
    getRequest,
    optionRequest,
    putRequest,
    deleteRequest,
    patchRequest,
    headRequest,
    config,
    mockQuery,
  };
};

describe('NetworkClient', () => {
  beforeAll(() => {});
  beforeEach(() => {
    NetworkRequestBuilder.mockReset();
    jest.clearAllMocks();
  });

  describe('request()', () => {
    const mockResponse: BaseResponse = {
      statusText: NETWORK_FAIL_TEXT.SOCKET_DISCONNECTED,
      status: RESPONSE_STATUS_CODE.LOCAL_NOT_NETWORK_CONNECTION,
    };
    it('networkManager addApiRequest should be called with request', () => {
      const { postRequest, rcNetworkClient } = setup();
      rcNetworkClient.request(postRequest);
      expect(networkManager.addApiRequest).toHaveBeenCalled();
    });

    it('request() should call return Promise', () => {
      const { postRequest, rcNetworkClient } = setup();
      const requestHolder: RequestHolder = { request: undefined };
      expect(
        rcNetworkClient.request(postRequest, requestHolder),
      ).toBeInstanceOf(Promise);
    });

    it('should switch to http if statusText is SOCKET_DISCONNECTED and NETWORK_VIA is All', done => {
      const { postRequest, rcNetworkClient } = setup();
      mockResponse.request = postRequest;
      jest
        .spyOn(rcNetworkClient, 'rawRequest')
        .mockResolvedValueOnce(mockResponse);
      const spy = jest.spyOn(rcNetworkClient, 'request');
      const requestHolder: RequestHolder = { request: undefined };
      rcNetworkClient.request(postRequest, requestHolder);
      setTimeout(() => {
        expect(spy).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should not switch to http if statusText is SOCKET_DISCONNECTED but NETWORK_VIA is SOCKET', async () => {
      const { postRequest, rcNetworkClient } = setup();
      postRequest.via = NETWORK_VIA.SOCKET;
      mockResponse.request = postRequest;
      const rawSpy = jest
        .spyOn(rcNetworkClient, 'rawRequest')
        .mockResolvedValueOnce(mockResponse);
      const spy = jest.spyOn(rcNetworkClient, 'request');
      const requestHolder: RequestHolder = { request: undefined };
      try {
        await rcNetworkClient.request(postRequest, requestHolder);
      } catch (error) {}
      expect(spy).toHaveBeenCalledTimes(1);
      expect(rawSpy).toHaveBeenCalledTimes(1);
    });

    it('should not switch to http if statusText is not SOCKET_DISCONNECTED but NETWORK_VIA is ALL', async () => {
      const { postRequest, rcNetworkClient } = setup();
      mockResponse.request = postRequest;
      mockResponse.statusText = NETWORK_FAIL_TEXT.BAD_REQUEST;
      const rawSpy = jest
        .spyOn(rcNetworkClient, 'rawRequest')
        .mockResolvedValueOnce(mockResponse);
      const spy = jest.spyOn(rcNetworkClient, 'request');
      const requestHolder: RequestHolder = { request: undefined };
      try {
        await rcNetworkClient.request(postRequest, requestHolder);
      } catch (error) {}
      expect(spy).toHaveBeenCalledTimes(1);
      expect(rawSpy).toHaveBeenCalledTimes(1);
    });

    it('should not switch to http if statusText is SOCKET_DISCONNECTED but request in response is undefined', async () => {
      const { postRequest, rcNetworkClient } = setup();
      mockResponse.statusText = NETWORK_FAIL_TEXT.BAD_REQUEST;
      const rawSpy = jest
        .spyOn(rcNetworkClient, 'rawRequest')
        .mockResolvedValueOnce(mockResponse);
      const spy = jest.spyOn(rcNetworkClient, 'request');
      const requestHolder: RequestHolder = { request: undefined };
      try {
        await rcNetworkClient.request(postRequest, requestHolder);
      } catch (error) {}
      expect(spy).toHaveBeenCalledTimes(1);
      expect(rawSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('duplicate request', () => {
    beforeEach(() => {
      networkManager.addApiRequest.mockClear();
    });

    const {
      getRequest,
      deleteRequest,
      postRequest,
      putRequest,
      headRequest,
      patchRequest,
      optionRequest,
    } = setup();

    it.each`
      request          | expectCallCnt | comment
      ${getRequest}    | ${1}          | ${'getRequest'}
      ${deleteRequest} | ${1}          | ${'deleteRequest'}
      ${postRequest}   | ${2}          | ${'postRequest'}
      ${putRequest}    | ${2}          | ${'putRequest'}
      ${headRequest}   | ${2}          | ${'headRequest'}
      ${patchRequest}  | ${2}          | ${'patchRequest'}
      ${optionRequest} | ${2}          | ${'optionRequest'}
    `(
      'should block duplicate reqeust when request type is GET and DELETE: $comment',
      ({ request, expectCallCnt }) => {
        expect.assertions(1);
        const { rcNetworkClient } = setup();

        rcNetworkClient.request(request);
        rcNetworkClient.request(request);

        expect(networkManager.addApiRequest).toHaveBeenCalledTimes(
          expectCallCnt,
        );
      },
    );
  });

  describe('http()', () => {
    it('should call request()', () => {
      const { rcNetworkClient, mockQuery } = setup();

      rcNetworkClient.request = jest.fn();
      rcNetworkClient.http(mockQuery);

      expect(rcNetworkClient.request).toHaveBeenCalledWith(
        mockQuery,
        undefined,
      );
    });
  });
  describe('get()', () => {
    it('should call http()', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'http');
      rcNetworkClient.get({ path: '/', via: NETWORK_VIA.HTTP });

      expect(rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/',
        via: NETWORK_VIA.HTTP,
        method: NETWORK_METHOD.GET,
      });
    });
  });
  describe('post()', () => {
    it('should call http()', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'request');
      rcNetworkClient.post({ path: '/' });

      expect(rcNetworkClient.request).toHaveBeenCalledWith({
        data: {},
        method: 'post',
        path: '/',
      });
    });

    it('should omit properties starts with __', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'request');
      rcNetworkClient.post({
        path: '/',
        data: {
          _id: 123,
          __draft: '123',
          a: true,
        },
      });

      expect(rcNetworkClient.request).toHaveBeenCalledWith({
        data: {
          _id: 123,
          a: true,
        },
        method: 'post',
        path: '/',
      });
    });
  });
  describe('put()', () => {
    it('should call http()', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'http');
      rcNetworkClient.put({
        path: '/',
        data: {
          _id: 123,
          __draft: '123',
          a: true,
        },
      });

      expect(rcNetworkClient.http).toHaveBeenCalledWith({
        data: {
          _id: 123,
          a: true,
        },
        method: 'put',
        path: '/',
      });
    });

    it('should omit properties starts with __', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'http');
      rcNetworkClient.put({ path: '/' });

      expect(rcNetworkClient.http).toHaveBeenCalledWith({
        data: {},
        method: 'put',
        path: '/',
      });
    });
  });

  describe('delete()', () => {
    it('should call http()', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'http');
      rcNetworkClient.delete({ path: '/' });

      expect(rcNetworkClient.http).toHaveBeenCalledWith({
        method: 'delete',
        path: '/',
      });
    });
  });

  describe('cancelRequest()', () => {
    it('should call networkManager to cancel request', () => {
      const { rcNetworkClient } = setup();
      const request: IRequest = undefined;
      rcNetworkClient.cancelRequest(request);
      expect(networkManager.cancelRequest).toHaveBeenCalledWith(undefined);
    });
  });
});
