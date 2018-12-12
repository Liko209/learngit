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
} from 'foundation';
import NetworkClient from '../NetworkClient';
import { HandleByRingCentral } from '../handlers';
import { ApiResultOk, ApiResultErr } from '../ApiResult';
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

      expect(rcNetworkClient.request(postRequest)).toBeInstanceOf(Promise);
    });

    it('should only send request once when request is totally same', async () => {
      expect.assertions(5);
      const { getRequest, rcNetworkClient } = setup();

      const promise1 = rcNetworkClient.request(getRequest);
      const promise2 = rcNetworkClient.request(getRequest);

      mockRequest.callback({ status: 200, data: { a: 1 } });

      expect(networkManager.addApiRequest).toHaveBeenCalledTimes(1);
      const response1 = await promise1;
      const response2 = await promise2;
      expect(response1).toHaveProperty('status', 200);
      expect(response2).toHaveProperty('status', 200);
      expect(response1).toHaveProperty('data', { a: 1 });
      expect(response2).toHaveProperty('data', { a: 1 });
    });
  });

  describe('buildCallback()', () => {
    it('should resolve with ApiResultOk', (done: jest.DoneCallback) => {
      expect.assertions(2);
      const { rcNetworkClient, getRequest } = setup();

      rcNetworkClient.request(getRequest).then((result: ApiResultOk<any>) => {
        expect(result).toHaveProperty('status', 200);
        expect(result).toHaveProperty('data', { a: 1 });
        done();
      });
      mockRequest.callback({
        status: 200,
        data: { a: 1 },
        headers: {},
      });
    });

    it('should resolve with ApiResultErr', (done: jest.DoneCallback) => {
      expect.assertions(2);
      const { rcNetworkClient, getRequest } = setup();

      rcNetworkClient.request(getRequest).then((result: ApiResultErr<any>) => {
        expect(result.status).toBe(500);
        expect(result.error.code).toBe(1500);
        done();
      });

      mockRequest.callback({
        status: 500,
        data: { a: {} },
        headers: {},
      });
    });
  });

  describe('http()', () => {
    it('should call request()', () => {
      const { rcNetworkClient, mockQuery } = setup();

      rcNetworkClient.request = jest.fn();
      rcNetworkClient.http(mockQuery);

      expect(rcNetworkClient.request).toHaveBeenCalledWith(mockQuery);
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
});
