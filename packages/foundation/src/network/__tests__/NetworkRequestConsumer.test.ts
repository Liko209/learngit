import NetworkRequestConsumer from '../NetworkRequestConsumer';
import { NETWORK_VIA } from '../network';
import {
  getFakeRequest,
  getFakeExecutor,
  getFakeHandler,
  getFakeClient,
} from './utils';

const consumer = new NetworkRequestConsumer(
  getFakeHandler(),
  getFakeClient(),
  10,
  NETWORK_VIA.ALL,
  getFakeHandler(),
  null,
);
describe('NetworkRequestConsumer', () => {
  describe('onConsumeArrived', () => {
    it('should call consume', () => {
      const spy = jest.spyOn(consumer, '_consume');
      consumer.onConsumeArrived();
      expect(spy).toBeCalled();
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
