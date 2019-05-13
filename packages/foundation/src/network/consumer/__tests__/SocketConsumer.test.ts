/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-03 20:32:35
 * Copyright © RingCentral. All rights reserved.
 */

import { SocketConsumer } from '../SocketConsumer';
import NetworkRequestDecorator from '../../NetworkRequestDecorator';
import NetworkRequestHandler from '../../NetworkRequestHandler';
import { NETWORK_VIA, CONSUMER_MAX_QUEUE_COUNT } from '../../network';

describe('SocketConsumer', () => {
  let consumer: SocketConsumer;
  const mockHandler = new NetworkRequestHandler({} as any, {} as any);
  const mockClient = { isNetworkReachable: jest.fn() } as any;
  const mockDecorator = new NetworkRequestDecorator({} as any);

  beforeEach(() => {
    consumer = new SocketConsumer(
      mockHandler,
      mockHandler,
      mockClient,
      mockDecorator,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should create with correct params', () => {
    expect(consumer['_via']).toEqual(NETWORK_VIA.SOCKET);
    expect(consumer['maxQueueCount']).toEqual(CONSUMER_MAX_QUEUE_COUNT.SOCKET);
  });

  describe('canHandleRequest', () => {
    it('should return true when can handle request', () => {
      mockClient.isNetworkReachable.mockReturnValue(true);
      consumer['isRequestExceeded'] = jest.fn().mockReturnValue(false);
      expect(consumer['canHandleRequest']()).toBeTruthy();
    });

    it('should return false when can handle request no matter isNetworkReachable', () => {
      mockClient.isNetworkReachable.mockReturnValue(false);
      consumer['isRequestExceeded'] = jest.fn().mockReturnValue(true);
      expect(consumer['canHandleRequest']()).toBeFalsy();

      mockClient.isNetworkReachable.mockReturnValue(true);
      consumer['isRequestExceeded'] = jest.fn().mockReturnValue(true);
      expect(consumer['canHandleRequest']()).toBeFalsy();
    });
  });
});
