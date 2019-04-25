/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-03 20:32:35
 * Copyright © RingCentral. All rights reserved.
 */

import { HttpConsumer } from '../HttpConsumer';
import NetworkRequestDecorator from '../../NetworkRequestDecorator';
import NetworkRequestHandler from '../../NetworkRequestHandler';
import { NETWORK_VIA, CONSUMER_MAX_QUEUE_COUNT } from '../../network';

describe('HttpConsumer', () => {
  let consumer: HttpConsumer;
  const mockHandler = new NetworkRequestHandler({} as any, {} as any);
  const mockClient = { mockName: 'client' } as any;
  const mockDecorator = new NetworkRequestDecorator({} as any);

  beforeEach(() => {
    consumer = new HttpConsumer(
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
    expect(consumer['_via']).toEqual(NETWORK_VIA.HTTP);
    expect(consumer['maxQueueCount']).toEqual(CONSUMER_MAX_QUEUE_COUNT.HTTP);
  });

  describe('canHandleRequest', () => {
    it('should return true when can handle request', () => {
      consumer['isRequestExceeded'] = jest.fn().mockReturnValue(false);
      expect(consumer['canHandleRequest']()).toBeTruthy();
    });

    it('should return false when can handle request', () => {
      consumer['isRequestExceeded'] = jest.fn().mockReturnValue(true);
      expect(consumer['canHandleRequest']()).toBeFalsy();
    });
  });
});
