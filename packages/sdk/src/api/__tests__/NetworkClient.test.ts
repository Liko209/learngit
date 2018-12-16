/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-07-23 14:46:38
 * Copyright © RingCentral. All rights reserved.
 */

/// <reference path="../../__tests__/types.d.ts" />
import {
  NetworkManager,
  NetworkRequestBuilder,
  NETWORK_VIA,
  NETWORK_METHOD,
  OAuthTokenManager,
  IRequest,
} from 'foundation';
import NetworkClient from '../NetworkClient';
import { HandleByRingCentral } from '../handlers';
import { ApiResultOk, ApiResultErr } from '../ApiResult';
import { RequestHolder } from '../glip/item';

// Using manual mock to improve mock priority.
jest.mock('foundation/src/network', () =>
  jest.genMockFromModule<any>('foundation/src/network'),
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
      setVia: jest.fn().mockReturnThis(),
      build: jest.fn().mockImplementation(() => mockRequest),
    };
  });
  const rcNetworkClient = new NetworkClient(
    {
      host: 'https://platform.ringcentral.com',
      handlerType: HandleByRingCentral,
    },
    '/restapi',
    NETWORK_VIA.HTTP,
    '',
    networkManager,
  );

  const postRequest = {
    path: '/',
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
    it('networkManager addApiRequest should be called with request', () => {
      const { postRequest, rcNetworkClient } = setup();
      rcNetworkClient.request(postRequest);
      expect(networkManager.addApiRequest).toBeCalled();
    });

    it('request() should call return Promise', () => {
      const { postRequest, rcNetworkClient } = setup();
      const requestHolder: RequestHolder = { request: undefined };
      expect(
        rcNetworkClient.request(postRequest, requestHolder),
      ).toBeInstanceOf(Promise);
    });

    it('should only send request once when request is totally same', async () => {
      expect.assertions(7);
      const { getRequest, rcNetworkClient } = setup();

      const mockRequest1: any = { path: '1' };
      const mockRequest2: any = { path: '2' };
      NetworkRequestBuilder.mockReset();
      const times = 0;
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
          setVia: jest.fn().mockReturnThis(),
          build: jest.fn().mockImplementation(() => {
            if (times === 0) {
              ++times;
              return mockRequest1;
            }
            return mockRequest2;
          }),
        };
      });

      const promise1 = rcNetworkClient.request(getRequest);
      const promise2 = rcNetworkClient.request(getRequest);

      mockRequest1.callback({ status: 200, data: { a: 1 } });

      const response1 = await promise1;
      const response2 = await promise2;
      expect(mockRequest1.callback).not.toBeUndefined();
      expect(mockRequest2.callback).toBeUndefined();
      expect(networkManager.addApiRequest).toHaveBeenCalledTimes(1);
      expect(response1).toHaveProperty('status', 200);
      expect(response1).toHaveProperty('data', { a: 1 });
      expect(response2).toHaveProperty('status', 200);
      expect(response2).toHaveProperty('data', { a: 1 });
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
      rcNetworkClient.get('/', {}, NETWORK_VIA.HTTP, {});

      expect(rcNetworkClient.http).toHaveBeenCalledWith({
        path: '/',
        method: 'get',
        params: {},
        via: NETWORK_VIA.HTTP,
        requestConfig: {},
        headers: {},
      });
    });
  });
  describe('post()', () => {
    it('should call http()', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'request');
      rcNetworkClient.post('/');

      expect(rcNetworkClient.request).toHaveBeenCalledWith({
        data: {},
        headers: {},
        method: 'post',
        path: '/',
      });
    });

    it('should omit properties starts with __', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'request');
      rcNetworkClient.post('/', {
        id: 123,
        __draft: '123',
        a: true,
      });

      expect(rcNetworkClient.request).toHaveBeenCalledWith({
        data: {
          id: 123,
          a: true,
        },
        headers: {},
        method: 'post',
        path: '/',
      });
    });
  });
  describe('put()', () => {
    it('should call http()', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'http');
      rcNetworkClient.put('/', {
        id: 123,
        __draft: '123',
        a: true,
      });

      expect(rcNetworkClient.http).toHaveBeenCalledWith({
        data: {
          id: 123,
          a: true,
        },
        headers: {},
        method: 'put',
        path: '/',
      });
    });

    it('should omit properties starts with __', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'http');
      rcNetworkClient.put('/');

      expect(rcNetworkClient.http).toHaveBeenCalledWith({
        data: {},
        headers: {},
        method: 'put',
        path: '/',
      });
    });
  });

  describe('delete()', () => {
    it('should call http()', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'http');
      rcNetworkClient.delete('/');

      expect(rcNetworkClient.http).toHaveBeenCalledWith({
        params: {},
        headers: {},
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
      expect(networkManager.cancelRequest).toBeCalledWith(undefined);
    });
  });
});
