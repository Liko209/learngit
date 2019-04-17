/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-11 13:08:06
 * Copyright © RingCentral. All rights reserved.
 */

import Socket from '../Socket';
import { SocketClient } from '../SocketIOClient';

describe('Socket', () => {
  let socket: Socket;
  const mockRequestFunc = jest.fn();
  const mockAvailableFunc = jest.fn();

  beforeEach(() => {
    socket = new Socket();
    SocketClient.get = jest.fn().mockReturnValue({
      request: mockRequestFunc,
      isClientAvailable: mockAvailableFunc,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('request()', () => {
    const mockListener = {
      onSuccess: jest.fn(),
      onFailure: jest.fn(),
    };

    it('should remove tasks and call onSuccess when send request successfully', done => {
      mockListener.onSuccess.mockImplementationOnce(() => {
        expect(socket.tasks.size).toEqual(0);
        done();
      });
      const mockResponse = 'mockResponse';
      mockRequestFunc.mockResolvedValueOnce(mockResponse);
      const mockRequest = {
        id: 123,
        params: 456,
      } as any;
      socket.request(mockRequest, mockListener);
    });

    it('should remove tasks and call onFailure when send request failed', done => {
      mockListener.onFailure.mockImplementationOnce(() => {
        expect(socket.tasks.size).toEqual(0);
        done();
      });
      const mockResponse = 'mockResponse';
      mockRequestFunc.mockRejectedValueOnce(mockResponse);
      const mockRequest = {
        id: 123,
        params: 456,
      } as any;
      socket.request(mockRequest, mockListener);
    });
  });

  describe('isNetworkReachable()', () => {
    it('should return false when socket is not available', () => {
      mockAvailableFunc.mockReturnValueOnce(false);
      expect(socket.isNetworkReachable()).toBeFalsy();
    });
  });
});
