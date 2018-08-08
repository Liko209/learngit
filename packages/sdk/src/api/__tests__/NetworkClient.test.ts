/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-07-23 14:46:38
 * Copyright © RingCentral. All rights reserved.
 */

/// <reference path="../../__tests__/types.d.ts" />
import { NetworkManager, NetworkRequestBuilder, NETWORK_VIA, NETWORK_METHOD } from 'foundation';
import NetworkClient from '../NetworkClient';
import { HandleByRingCentral } from '../handlers';

// Using manual mock to improve mock priority.
jest.mock('foundation', () => jest.genMockFromModule<any>('foundation'));

NetworkManager.Instance = new NetworkManager();
const mockRequest: any = {};

const setup = () => {
  NetworkRequestBuilder.mockImplementation(() => {
    return {
      setHost: jest.fn().mockReturnThis(),
      setHandlerType: jest.fn().mockReturnThis(),
      setPath: jest.fn().mockReturnThis(),
      setMethod: jest.fn().mockReturnThis(),
      setData: jest.fn().mockReturnThis(),
      setHeaders: jest.fn().mockReturnThis(),
      setParams: jest.fn().mockReturnThis(),
      setAuthfree: jest.fn().mockReturnThis(),
      setRequestConfig: jest.fn().mockReturnThis(),
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

describe('apiRequest', () => {
  beforeAll(() => { });
  beforeEach(() => {
    NetworkRequestBuilder.mockReset();
    jest.clearAllMocks();
  });
  describe('request()', () => {
    it('networkManager addApiRequest should be called with request', () => {
      const { postRequest, rcNetworkClient } = setup();

      // const spy = jest.spyOn(NetworkManager.Instance, 'addApiRequest');
      rcNetworkClient.request(postRequest);
      expect(NetworkManager.Instance.addApiRequest).toBeCalled();
    });

    it('request() should call return Promise', () => {
      const { postRequest, rcNetworkClient } = setup();

      expect(rcNetworkClient.request(postRequest)).toBeInstanceOf(Promise);
    });

    it('should only send request once when request is totally same', async () => {
      expect.assertions(3);
      const { getRequest, rcNetworkClient } = setup();

      const promise1 = rcNetworkClient.request(getRequest);
      const promise2 = rcNetworkClient.request(getRequest);

      mockRequest.callback({ status: 200, data: { a: 1 } });

      expect(NetworkManager.Instance.addApiRequest).toHaveBeenCalledTimes(1);
      await expect(promise1).resolves.toEqual({ status: 200, data: { a: 1 } });
      await expect(promise2).resolves.toEqual({ status: 200, data: { a: 1 } });
    });
  });

  describe('buildCallback()', () => {
    it('promise should resolve with response', async () => {
      expect.assertions(1);
      const { rcNetworkClient, getRequest } = setup();
      const promise = rcNetworkClient.request(getRequest);

      mockRequest.callback({ status: 200, data: { a: 1 } });
      await expect(promise).resolves.toEqual({ status: 200, data: { a: 1 } });
    });

    it('promise should reject with response', async () => {
      const { rcNetworkClient, getRequest } = setup();
      const promise = rcNetworkClient.request(getRequest);

      mockRequest.callback({ status: 500, data: { a: 'fail' } });
      await expect(promise).rejects.toEqual({ data: { a: 'fail' }, status: 500 });
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

      expect(rcNetworkClient.request)
        .toHaveBeenCalledWith({ data: {}, headers: {}, method: 'post', path: '/' });
    });
  });
  describe('put()', () => {
    it('should call http()', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'http');
      rcNetworkClient.put('/');

      expect(rcNetworkClient.http)
        .toHaveBeenCalledWith({ data: {}, headers: {}, method: 'put', path: '/' });
    });
  });

  describe('delete()', () => {
    it('should call http()', () => {
      const { rcNetworkClient } = setup();

      jest.spyOn(rcNetworkClient, 'http');
      rcNetworkClient.delete('/');

      expect(rcNetworkClient.http)
        .toHaveBeenCalledWith({ params: {}, headers: {}, method: 'delete', path: '/' });
    });
  });
});
