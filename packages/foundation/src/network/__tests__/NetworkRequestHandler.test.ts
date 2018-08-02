import NetworkRequestHandler from '../NetworkRequestHandler';
import {
  fakeHandleType,
  getFakeTokenManager,
  getFakeRequest,
  getFakeConsumer,
  getFakeTask,
  getFakeSurvivalMode
} from './utils';
import { NETWORK_VIA, REQUEST_PRIORITY, SURVIVAL_MODE } from '../network';
const handler = new NetworkRequestHandler(
  getFakeTokenManager(),
  fakeHandleType
);
const consumer = getFakeConsumer();
describe('NetworkRequestHandler', () => {
  describe('init', () => {
    it('should call initPendingTasks', () => {
      const spy = jest.spyOn(handler, 'initPendingTasks');
      handler.init();
      expect(spy).toBeCalled();
    });
  });

  describe('initPendingTasks', () => {
    it('should call set 4 times', () => {
      const spy = jest.spyOn(handler.pendingTasks, 'set');
      handler.initPendingTasks();
      expect(spy).toBeCalled();
    });
  });

  describe('addRequestConsumer', () => {
    it('should add to consumers', () => {
      handler.addRequestConsumer(NETWORK_VIA.HTTP, consumer);
      expect(handler.consumers.get(NETWORK_VIA.HTTP)).toEqual(consumer);
    });
  });

  describe('addApiRequest', () => {
    it('should call appendTask and notifyRequestArrived', () => {
      const spy = jest.spyOn(handler, 'appendTask');
      const spy1 = jest.spyOn(handler, 'notifyRequestArrived');
      handler.addApiRequest(getFakeRequest(), false);
      expect(spy1).toBeCalled();
      expect(spy).toBeCalled();
    });
  });

  describe('pause', () => {
    it('should pause', () => {
      handler.pause();
      expect(handler.isPause).toBeTruthy();
    });
  });

  describe('resume', () => {
    it('should resume', () => {
      const spy = jest.spyOn(handler, 'notifyRequestArrived');
      handler.resume();
      expect(spy).toBeCalled();
      expect(handler.isPause).not.toBeTruthy();
    });
  });

  describe('cancelAll', () => {
    it('should cancel pending tasks and consumers', () => {
      const spy = jest.spyOn(handler, 'cancelAllPendingTasks');
      const spy1 = jest.spyOn(handler, 'cancelAllConsumers');
      handler.cancelAll();
      expect(spy1).toBeCalled();
      expect(spy).toBeCalled();
    });
  });

  describe('cancelRequest', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call onCancelRequest', () => {
      handler.isRequestInPending = jest.fn();
      handler.isRequestInPending.mockReturnValueOnce(false);
      const spy = jest.spyOn(
        handler.consumers.get(getFakeRequest().via),
        'onCancelRequest'
      );
      handler.cancelRequest(getFakeRequest());
      expect(spy).toBeCalled();
    });

    it('should call onCancelRequest', () => {
      handler.isRequestInPending = jest.fn();
      handler.isRequestInPending.mockReturnValueOnce(true);
      const spy = jest.spyOn(handler, 'deletePendingRequest');
      const spy1 = jest.spyOn(handler, 'callXApiResponseCallback');
      handler.cancelRequest(getFakeRequest());
      expect(spy1).toBeCalled();
      expect(spy).toBeCalled();
    });
  });

  describe('notifyTokenRefreshed', () => {
    it('should refresh token for consumers', () => {
      const spys = [];
      handler.consumers.forEach(consumer => {
        const spy = jest.spyOn(consumer, 'onTokenRefreshed');
        spys.push(spy);
      });
      handler.notifyTokenRefreshed();
      spys.forEach(spy => {
        expect(spy).toBeCalled();
      });
    });
  });

  describe('produceRequest', () => {
    it('should changeTaskWeight twice', () => {
      const task = getFakeTask();
      handler.nextTaskInQueue = jest.fn();
      handler.nextTaskInQueue.mockReturnValueOnce(task);
      const spy = jest.spyOn(handler, 'changeTaskWeight');
      const request = handler.produceRequest(getFakeRequest().via);
      expect(request).toEqual(task.request);
      expect(spy).toBeCalled();
    });
  });

  describe('canProduceRequest', () => {
    it('should produce specific priority', () => {
      expect(handler.canProduceRequest(REQUEST_PRIORITY.SPECIFIC)).toBeTruthy();
    });

    it('should produce unspecific priority when pause', () => {
      handler.isPause = true;
      expect(handler.canProduceRequest(REQUEST_PRIORITY.LOW)).toBeFalsy();
    });
  });

  describe('getRequestConsumer', () => {
    it('should add to consumers', () => {
      const ori_consumer = handler.getRequestConsumer(NETWORK_VIA.HTTP);
      expect(consumer).toEqual(ori_consumer);
    });
  });

  describe('getOAuthTokenManager', () => {
    it('should return tokenManager', () => {
      expect(handler.getOAuthTokenManager()).toEqual(handler.tokenManager);
    });
  });

  describe('notifyRequestArrived', () => {
    it('should should call onConsumeArrived', () => {
      const spy = jest.spyOn(
        handler.consumers.get(NETWORK_VIA.HTTP),
        'onConsumeArrived'
      );
      handler.notifyRequestArrived(NETWORK_VIA.HTTP);
      expect(spy).toBeCalled();
    });

    it('should should call onConsumeArrived', () => {
      const spy = jest.spyOn(
        handler.consumers.get(NETWORK_VIA.HTTP),
        'onConsumeArrived'
      );
      handler.notifyRequestArrived(NETWORK_VIA.ALL);
      expect(spy).toBeCalled();
    });
  });

  describe('appendTask', () => {
    it('should push when tail', () => {
      const queue = [];
      handler.pendingTasks.get = jest.fn();
      handler.pendingTasks.get.mockReturnValueOnce(queue);
      const spy = jest.spyOn(queue, 'push');
      handler.appendTask(getFakeTask(), true);
      expect(spy).toBeCalled();
    });

    it('should unshift when not tail', () => {
      const queue = [];
      handler.pendingTasks.get = jest.fn();
      handler.pendingTasks.get.mockReturnValueOnce(queue);
      const spy = jest.spyOn(queue, 'unshift');
      handler.appendTask(getFakeTask(), false);
      expect(spy).toBeCalled();
    });
  });

  describe('cancelAllConsumers', () => {
    it('should call onCancelAll', () => {
      const spys = [];
      handler.consumers.forEach(consumer => {
        const spy = jest.spyOn(consumer, 'onCancelAll');
        spys.push(spy);
      });
      handler.cancelAllConsumers();
      spys.forEach(spy => {
        expect(spy).toBeCalled();
      });
    });
  });

  describe('cancelAllPendingTasks', () => {
    it('should init pendingTasks', () => {
      const spy = jest.spyOn(handler, 'initPendingTasks');
      handler.cancelAllPendingTasks();
      expect(spy).toBeCalled();
    });
  });

  describe('setNetworkRequestSurvivalMode', () => {
    it('should set survivalMode to member', () => {
      const survivalMode = getFakeSurvivalMode();
      handler.setNetworkRequestSurvivalMode(survivalMode);
      expect(handler.networkRequestSurvivalMode).toEqual(survivalMode);
    });

    it('should be SurvivalModeEnabled', () => {
      expect(handler.isSurvivalModeEnabled()).toBeTruthy();
    });

    it('should be InSurvivalMode', () => {
      handler.networkRequestSurvivalMode.isSurvivalMode = jest.fn();
      handler.networkRequestSurvivalMode.isSurvivalMode.mockReturnValueOnce(
        true
      );
      expect(handler.isInSurvivalMode()).toBeTruthy();
    });

    it('should can HandleSurvivalMode', () => {
      handler.networkRequestSurvivalMode.canSupportSurvivalMode = jest.fn();
      handler.networkRequestSurvivalMode.canSupportSurvivalMode.mockReturnValueOnce(
        true
      );
      expect(handler.canHandleSurvivalMode()).toBeTruthy();
    });
  });

  describe('onAccessTokenInvalid', () => {
    it('should call refreshOAuthToken of tokenManager', () => {
      const spy = jest.spyOn(handler.tokenManager, 'refreshOAuthToken');
      handler.onAccessTokenInvalid(fakeHandleType);
      expect(spy).toBeCalled();
    });
  });

  describe('onSurvivalModeDetected', () => {
    it('should call setSurvivalMode and cancelAllPendingTasks', () => {
      handler.isInSurvivalMode = jest.fn();
      handler.isInSurvivalMode.mockReturnValueOnce(true);
      const spy = jest.spyOn(
        handler.networkRequestSurvivalMode,
        'setSurvivalMode'
      );
      const spy1 = jest.spyOn(handler, 'cancelAllPendingTasks');
      handler.onSurvivalModeDetected(SURVIVAL_MODE.NORMAL, 1);
      expect(spy1).toBeCalled();
      expect(spy).toBeCalled();
    });
  });
});
