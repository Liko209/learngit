/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-03 19:36:21
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractConsumer } from '../AbstractConsumer';
import {
  INetworkRequestProducer,
  NETWORK_VIA,
  IResponseListener,
} from '../../network';
import BaseClient from '../../client/BaseClient';
import NetworkRequestDecorator from '../../NetworkRequestDecorator';
import NetworkRequestHandler from '../../NetworkRequestHandler';
import { NetworkRequestExecutor } from '../../NetworkRequestExecutor';

jest.mock('../../NetworkRequestDecorator');
jest.mock('../../NetworkRequestExecutor');

class TestConsumer extends AbstractConsumer {
  constructor(
    producer: INetworkRequestProducer,
    responseListener: IResponseListener,
    client: BaseClient,
    networkRequestDecorator: NetworkRequestDecorator,
    via: NETWORK_VIA,
  ) {
    super(producer, responseListener, client, networkRequestDecorator, via);
  }

  canHandleRequest() {
    return false;
  }
}

describe('AbstractConsumer', () => {
  let consumer: TestConsumer;
  const mockHandler = new NetworkRequestHandler({} as any, {} as any);
  const mockClient = {
    mockName: 'client',
    isNetworkReachable: jest.fn(),
  } as any;
  const mockDecorator = new NetworkRequestDecorator({} as any);

  beforeEach(() => {
    consumer = new TestConsumer(
      mockHandler,
      mockHandler,
      mockClient,
      mockDecorator,
      NETWORK_VIA.SOCKET,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('onConsumeArrived()', () => {
    it('should call consume', () => {
      consumer['_consume'] = jest.fn();
      consumer.onConsumeArrived();
      expect(consumer['_consume']).toBeCalled();
    });
  });

  describe('onCancelAll()', () => {
    it('should cancel executor', () => {
      const mockExecutor = {
        cancel: jest.fn(),
      } as any;
      consumer['_executorQueue'].set('test', mockExecutor);
      consumer.onCancelAll();
      expect(mockExecutor.cancel).toBeCalled();
    });
  });

  describe('onCancelRequest()', () => {
    it('should cancel correct executor', () => {
      const mockExecutor = {
        cancel: jest.fn(),
      } as any;
      consumer['_executorQueue'].set('test', mockExecutor);
      consumer.onCancelRequest({ id: 'test' } as any);
      expect(mockExecutor.cancel).toBeCalled();
    });
  });

  describe('onTokenRefreshed()', () => {
    it('should execute paused request', () => {
      const mockExecutor = {
        isPause: jest.fn().mockReturnValue(true),
        execute: jest.fn(),
      } as any;
      consumer['_executorQueue'].set('test', mockExecutor);
      consumer.onTokenRefreshed();
      expect(mockExecutor.execute).toBeCalled();
    });
  });

  describe('onConsumeFinished()', () => {
    it('should remove executor and consume next one', () => {
      const mockExecutor = {
        mockName: 'executor',
      } as any;
      consumer['_removeExecutor'] = jest.fn();
      consumer['_consume'] = jest.fn();
      consumer.onConsumeFinished(mockExecutor);
      expect(consumer['_removeExecutor']).toBeCalledWith(mockExecutor);
      expect(consumer['_consume']).toBeCalled();
    });
  });

  describe('_consume()', () => {
    it('should do nothing when can not handle request and has no immediate task', () => {
      consumer.canHandleRequest = jest.fn().mockReturnValue(false);
      NetworkRequestHandler.prototype.produceRequest = jest
        .fn()
        .mockReturnValue(undefined);
      mockHandler.hasImmediateTask = jest.fn().mockReturnValue(false);
      consumer['_consume']();
      expect(NetworkRequestHandler.prototype.produceRequest).not.toBeCalled();
    });

    it('should do nothing when can not handle request and has immediate task', () => {
      consumer.canHandleRequest = jest.fn().mockReturnValue(false);
      NetworkRequestHandler.prototype.produceRequest = jest
        .fn()
        .mockReturnValue(undefined);
      mockHandler.hasImmediateTask = jest.fn().mockReturnValue(true);
      consumer['_consume']();
      expect(NetworkRequestHandler.prototype.produceRequest).toBeCalled();
    });

    it('should do nothing when can not get request', () => {
      consumer.canHandleRequest = jest.fn().mockReturnValue(true);
      mockClient.isNetworkReachable.mockReturnValue(true);
      NetworkRequestHandler.prototype.produceRequest = jest
        .fn()
        .mockReturnValue(undefined);
      consumer['_addExecutor'] = jest.fn();
      consumer['_consume']();
      expect(NetworkRequestHandler.prototype.produceRequest).toBeCalledWith(
        consumer['_via'],
        true,
      );
      expect(consumer['_addExecutor']).not.toBeCalled();
    });

    it('should create executor', () => {
      consumer.canHandleRequest = jest.fn().mockReturnValue(true);
      mockClient.isNetworkReachable.mockReturnValue(true);
      NetworkRequestHandler.prototype.produceRequest = jest
        .fn()
        .mockReturnValue('mockRequest');
      consumer['_addExecutor'] = jest.fn();
      consumer['_consume']();
      // expect(NetworkRequestHandler.prototype.produceRequest).toBeCalled();
      expect(NetworkRequestHandler.prototype.produceRequest).toBeCalledWith(
        consumer['_via'],
        true,
      );
      expect(consumer['_addExecutor']).toBeCalled();
      expect(NetworkRequestExecutor.prototype.execute).toBeCalled();
    });
  });

  describe('_addExecutor()', () => {
    it('should set to queue', () => {
      const mockExecutor = {
        getRequest: jest.fn().mockReturnValue({
          id: 'testExecutor',
        }),
      } as any;
      consumer['_addExecutor'](mockExecutor);
      expect(consumer['_executorQueue'].size).toEqual(1);
      expect(consumer['_executorQueue'].get('testExecutor')).toEqual(
        mockExecutor,
      );
    });
  });

  describe('_removeExecutor', () => {
    it('should remove from queue', () => {
      const mockExecutor = {
        getRequest: jest.fn().mockReturnValue({
          id: 'testExecutor',
        }),
      } as any;
      consumer['_executorQueue'].set('testExecutor', mockExecutor);
      consumer['_removeExecutor'](mockExecutor);
      expect(consumer['_executorQueue'].size).toEqual(0);
    });
  });

  describe('_getExecutor', () => {
    it('should get from queue', () => {
      const mockExecutor = {
        getRequest: jest.fn().mockReturnValue({
          id: 'testExecutor',
        }),
      } as any;
      consumer['_executorQueue'].set('testExecutor', mockExecutor);
      expect(consumer['_getExecutor']('testExecutor')).toEqual(mockExecutor);
    });
  });

  describe('isRequestExceeded', () => {
    it('should return true when request is exceeded', () => {
      consumer['_executorQueue'].set('testExecutor', {} as any);
      consumer['_executorQueue'].set('testExecutor2', {} as any);
      consumer['maxQueueCount'] = 2;
      expect(consumer['isRequestExceeded']()).toBeTruthy();
    });

    it('should return false when request is not exceeded', () => {
      consumer['_executorQueue'].set('testExecutor', {} as any);
      consumer['maxQueueCount'] = 2;
      expect(consumer['isRequestExceeded']()).toBeFalsy();
    });
  });
});
