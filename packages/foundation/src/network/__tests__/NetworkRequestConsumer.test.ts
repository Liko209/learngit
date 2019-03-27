import NetworkRequestConsumer from '../NetworkRequestConsumer';
import { NETWORK_VIA, NETWORK_FAIL_TYPE } from '../network';
import {
  getFakeRequest,
  getFakeExecutor,
  getFakeHandler,
  getFakeClient,
  getFakeDecoration,
} from './utils';
import NetworkRequestDecorator from '../NetworkRequestDecorator';
import { NetworkRequestExecutor } from '../NetworkRequestExecutor';

const client = getFakeClient();
const handler = getFakeHandler();
const decorate = new NetworkRequestDecorator(getFakeDecoration());
handler.produceRequest = jest.fn();
client.isNetworkReachable = jest.fn();

const consumer = new NetworkRequestConsumer(
  handler,
  client,
  10,
  NETWORK_VIA.ALL,
  handler,
  decorate,
);

describe('NetworkRequestConsumer', () => {
  describe('onConsumeArrived', () => {
    it('should call consume', () => {
      const spy = jest.spyOn(consumer, '_consume');
      consumer.onConsumeArrived();
      expect(spy).toBeCalled();
    });

    it.only('should consume the request if network is disconnected', () => {
      handler.produceRequest.mockImplementationOnce(() => {
        return { id: 10, path: '/' };
      });
      client.isNetworkReachable.mockImplementationOnce(() => {
        return false;
      });
      const executeSpy = jest.spyOn(consumer, '_addExecutor');
      const responseSpy = (NetworkRequestExecutor.prototype['_callXApiResponse'] = jest.fn());
      consumer.onConsumeArrived();
      expect(executeSpy).toBeCalled();
      expect(responseSpy).toBeCalledWith(
        0,
        NETWORK_FAIL_TYPE.NOT_NETWORK_CONNECTION,
      );
    });
  });

  describe('onCancelAll', () => {
    it('should call all executor cancel', () => {
      const spys = [];
      consumer._executorQueue.forEach(executor => {
        const spy = jest.spyOn(executor, 'cancel');
        return spys.push(spy);
      });
      consumer.onCancelAll();
      spys.forEach(spy => {
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('onCancelRequest', () => {
    it('should cancel executor for request', () => {
      const spy = jest.spyOn(consumer, '_getExecutor');
      consumer.onCancelRequest(getFakeRequest());
      expect(spy).toBeCalled();
    });
  });

  describe('onTokenRefreshed', () => {
    const spys = [];
    consumer._executorQueue.forEach(executor => {
      const spy = jest.spyOn(executor, 'execute');
      return spys.push(spy);
    });
    consumer.onTokenRefreshed();
    spys.forEach(spy => {
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onConsumeFinished', () => {
    const spy = jest.spyOn(consumer, '_removeExecutor');
    consumer.onConsumeFinished(getFakeExecutor());
    expect(spy).toBeCalled();
  });
});
