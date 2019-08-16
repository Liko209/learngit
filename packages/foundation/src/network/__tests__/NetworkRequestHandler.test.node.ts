import NetworkRequestHandler from '../NetworkRequestHandler';
import {
  fakeHandleType,
  getFakeTokenManager,
  getFakeRequest,
  getFakeConsumer,
  getFakeTask,
  getFakeSurvivalMode,
} from './utils';
import { NETWORK_VIA, REQUEST_PRIORITY, SURVIVAL_MODE } from '../network';
import RequestTask from '../RequestTask';

let handler: NetworkRequestHandler;
const consumer = getFakeConsumer();
describe('NetworkRequestHandler', () => {
  beforeEach(() => {
    handler = new NetworkRequestHandler(getFakeTokenManager(), fakeHandleType);
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should call initPendingTasks', () => {
      const spy = jest.spyOn(handler, 'initPendingTasks');
      handler.init();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('initPendingTasks', () => {
    it('should call set 4 times', () => {
      const spy = jest.spyOn(handler.pendingTasks, 'set');
      handler.initPendingTasks();
      expect(spy).toHaveBeenCalled();
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
      expect(spy1).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should call _callXApiResponseCallback when request is limited in survival mode', () => {
      jest.spyOn(handler, 'isSurvivalModeEnabled').mockReturnValueOnce(true);
      jest.spyOn(handler, 'isInSurvivalMode').mockReturnValueOnce(true);
      jest.spyOn(handler, 'canHandleInSurvivalMode').mockReturnValueOnce(false);
      jest.spyOn(handler, '_callXApiResponseCallback');
      jest.spyOn(handler, 'appendTask');
      jest.spyOn(handler, 'notifyRequestArrived');
      handler.addApiRequest(getFakeRequest(), false);
      expect(handler.isSurvivalModeEnabled).toHaveBeenCalled();
      expect(handler.isInSurvivalMode).toHaveBeenCalled();
      expect(handler.canHandleInSurvivalMode).toHaveBeenCalled();
      expect(handler._callXApiResponseCallback).toHaveBeenCalled();
      expect(handler.appendTask).not.toHaveBeenCalled();
      expect(handler.notifyRequestArrived).not.toHaveBeenCalled();
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
      expect(spy).toHaveBeenCalled();
      expect(handler.isPause).not.toBeTruthy();
    });
  });

  describe('cancelAll', () => {
    it('should cancel pending tasks and consumers', () => {
      const spy = jest.spyOn(handler, 'cancelAllPendingTasks');
      const spy1 = jest.spyOn(handler, 'cancelAllConsumers');
      handler.cancelAll();
      expect(spy1).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('cancelRequest', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call onCancelRequest', () => {
      jest.spyOn(handler, 'isRequestInPending').mockReturnValueOnce(false);
      const consumer = getFakeConsumer();
      consumer.onCancelRequest = jest.fn();
      jest.spyOn(handler.consumers, 'get').mockReturnValueOnce(consumer);
      handler.cancelRequest(getFakeRequest());
      expect(consumer.onCancelRequest).toHaveBeenCalled();
    });

    it('should call onCancelRequest', () => {
      jest.spyOn(handler, 'isRequestInPending').mockReturnValueOnce(true);
      jest.spyOn(handler, 'deletePendingRequest');
      jest.spyOn(handler, '_callXApiResponseCallback');
      handler.cancelRequest(getFakeRequest());
      expect(handler.deletePendingRequest).toHaveBeenCalled();
      expect(handler._callXApiResponseCallback).toHaveBeenCalled();
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
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('produceRequest', () => {
    it('should changeTaskWeight twice', () => {
      const task = getFakeTask();
      handler._nextTaskInQueue = jest.fn();
      handler._nextTaskInQueue.mockReturnValueOnce(task);
      const spy = jest.spyOn(handler, '_changeTaskWeight');
      const request = handler.produceRequest(getFakeRequest().via);
      expect(request).toEqual(task.request);
      expect(spy).toHaveBeenCalled();
    });
    it('should handle NETWORK_VIA.ALL when via isViaReachable', () => {
      const task = getFakeTask();
      task.setVia(NETWORK_VIA.ALL);
      const tasks = [task];
      handler['_nextTaskInQueue'](NETWORK_VIA.SOCKET, tasks, true);
      expect(tasks.length).toEqual(0);
    });

    it('should modify task via when via !isViaReachable', () => {
      const task = getFakeTask();
      task.setVia(NETWORK_VIA.SOCKET);
      const tasks = [task];
      handler['_nextTaskInQueue'](NETWORK_VIA.SOCKET, tasks, false);
      expect(tasks.length).toEqual(0);
    });

    it('should modify task via when via !isViaReachable', () => {
      const task = getFakeTask();
      task.setVia(NETWORK_VIA.ALL);
      const tasks = [task];
      handler.isInSurvivalMode = jest.fn().mockReturnValue(false);
      handler['_nextTaskInQueue'](NETWORK_VIA.SOCKET, tasks, false);
      expect(task.via()).toEqual(NETWORK_VIA.HTTP);
      handler['_nextTaskInQueue'](NETWORK_VIA.HTTP, tasks, false);
      expect(tasks.length).toEqual(0);
    });
  });

  describe('hasImmediateTask', () => {
    it('should return false when pendingTasks has no immediate task', () => {
      handler.pendingTasks.get = jest.fn().mockReturnValue([]);
      const result = handler.hasImmediateTask(NETWORK_VIA.HTTP);
      expect(result).toBeFalsy();
    });
    it('should return true when pendingTasks has immediate task and via is the same', () => {
      const request = getFakeRequest();
      request.setVia(NETWORK_VIA.HTTP);
      const task = new RequestTask(request);
      handler.pendingTasks.get = jest.fn().mockReturnValue([task]);
      const result = handler.hasImmediateTask(NETWORK_VIA.HTTP);
      expect(result).toBeTruthy();
    });
    it('should return true when pendingTasks has immediate task and via is all', () => {
      const request = getFakeRequest();
      request.setVia(NETWORK_VIA.ALL);
      const task = new RequestTask(request);
      handler.pendingTasks.get = jest.fn().mockReturnValue([task]);
      const result = handler.hasImmediateTask(NETWORK_VIA.HTTP);
      expect(result).toBeTruthy();
    });
  });

  describe('canProduceRequest', () => {
    it('should produce immediate priority', () => {
      expect(
        handler.canProduceRequest(REQUEST_PRIORITY.IMMEDIATE),
      ).toBeTruthy();
    });

    it('should produce unimmediate priority when pause', () => {
      handler.isPause = true;
      expect(handler.canProduceRequest(REQUEST_PRIORITY.LOW)).toBeFalsy();
    });
  });

  describe('getRequestConsumer', () => {
    it('should add to consumers', () => {
      jest.spyOn(handler.consumers, 'get');
      handler.getRequestConsumer(NETWORK_VIA.HTTP);
      expect(handler.consumers.get).toHaveBeenCalledWith(NETWORK_VIA.HTTP);
    });
  });

  describe('getOAuthTokenManager', () => {
    it('should return tokenManager', () => {
      expect(handler.getOAuthTokenManager()).toEqual(handler.tokenManager);
    });
  });

  describe('getOAuthTokenHandler', () => {
    it('should return getOAuthTokenHandler', () => {
      expect(handler.getOAuthTokenHandler()).toEqual(
        handler.tokenManager.getOAuthTokenHandler(handler.type),
      );
    });
  });

  describe('notifyRequestArrived', () => {
    it('should should call onConsumeArrived', () => {
      handler.addRequestConsumer(NETWORK_VIA.HTTP, consumer);
      const spy = jest.spyOn(
        handler.consumers.get(NETWORK_VIA.HTTP),
        'onConsumeArrived',
      );
      handler.notifyRequestArrived(NETWORK_VIA.HTTP);
      expect(spy).toHaveBeenCalled();
    });

    it('should should call onConsumeArrived', () => {
      handler.addRequestConsumer(NETWORK_VIA.ALL, consumer);
      const spy = jest.spyOn(
        handler.consumers.get(NETWORK_VIA.ALL),
        'onConsumeArrived',
      );
      handler.notifyRequestArrived(NETWORK_VIA.ALL);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('appendTask', () => {
    it('should push when tail', () => {
      const queue = [];
      handler.pendingTasks.get = jest.fn();
      handler.pendingTasks.get.mockReturnValueOnce(queue);
      const spy = jest.spyOn(queue, 'push');
      handler.appendTask(getFakeTask(), true);
      expect(spy).toHaveBeenCalled();
    });

    it('should unshift when not tail', () => {
      const queue = [];
      handler.pendingTasks.get = jest.fn();
      handler.pendingTasks.get.mockReturnValueOnce(queue);
      const spy = jest.spyOn(queue, 'unshift');
      handler.appendTask(getFakeTask(), false);
      expect(spy).toHaveBeenCalled();
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
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('cancelAllPendingTasks', () => {
    it('should init pendingTasks', () => {
      const spy = jest.spyOn(handler, 'initPendingTasks');
      handler.cancelAllPendingTasks();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('setNetworkRequestSurvivalMode', () => {
    it('should set survivalMode to member', () => {
      const survivalMode = getFakeSurvivalMode();
      handler.setNetworkRequestSurvivalMode(survivalMode);
      expect(handler.networkRequestSurvivalMode).toEqual(survivalMode);
    });

    it('should be SurvivalModeEnabled', () => {
      handler.setNetworkRequestSurvivalMode(getFakeSurvivalMode());
      expect(handler.isSurvivalModeEnabled()).toBeTruthy();
    });

    it('should be InSurvivalMode', () => {
      handler.setNetworkRequestSurvivalMode(getFakeSurvivalMode());
      handler.networkRequestSurvivalMode.isSurvivalMode = jest.fn();
      handler.networkRequestSurvivalMode.isSurvivalMode.mockReturnValueOnce(
        true,
      );
      expect(handler.isInSurvivalMode()).toBeTruthy();
    });

    it('should can HandleSurvivalMode', () => {
      handler.setNetworkRequestSurvivalMode(getFakeSurvivalMode());
      handler.networkRequestSurvivalMode.canSupportSurvivalMode = jest.fn();
      handler.networkRequestSurvivalMode.canSupportSurvivalMode.mockReturnValueOnce(
        true,
      );
    });
  });

  describe('onAccessTokenInvalid', () => {
    it('should call refreshOAuthToken of tokenManager', () => {
      const spy = jest.spyOn(handler.tokenManager, 'refreshOAuthToken');
      handler.onAccessTokenInvalid(fakeHandleType);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onSurvivalModeDetected', () => {
    it('should call setSurvivalMode and cancelAllPendingTasks', () => {
      const mode = getFakeSurvivalMode();
      handler.setNetworkRequestSurvivalMode(mode);
      jest.spyOn(handler, 'isSurvivalModeEnabled').mockReturnValueOnce(true);
      const spy = jest.spyOn(
        handler.networkRequestSurvivalMode,
        'setSurvivalMode',
      );
      handler.onSurvivalModeDetected(SURVIVAL_MODE.NORMAL, 1);
      expect(spy).toHaveBeenCalled();

      mode.clearTimer();
    });
  });
});
