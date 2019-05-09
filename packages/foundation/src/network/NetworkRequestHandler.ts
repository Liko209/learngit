/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:48
 * Copyright © RingCentral. All rights reserved.
 */
import RequestTask from './RequestTask';
import NetworkTokenManager from './OAuthTokenManager';
import { AbstractConsumer } from './consumer';
import NetworkRequestSurvivalMode from './NetworkRequestSurvivalMode';
import { HttpResponseBuilder } from './client/http';
import {
  INetworkRequestProducer,
  INetworkRequestConsumerListener,
  REQUEST_PRIORITY,
  IResponseListener,
  IHandleType,
  NETWORK_FAIL_TYPE,
  IRequest,
  NETWORK_VIA,
  REQUEST_WEIGHT,
  SURVIVAL_MODE,
  HA_PRIORITY,
} from './network';
import { networkLogger } from '../log';
import { NetworkRequestBuilder } from './client';

class NetworkRequestHandler
  implements IResponseListener, INetworkRequestProducer {
  pendingTasks: Map<REQUEST_PRIORITY, RequestTask[]>;
  consumers: Map<NETWORK_VIA, INetworkRequestConsumerListener>;
  isPause: boolean;
  type: IHandleType;
  tokenManager: NetworkTokenManager;
  networkRequestSurvivalMode?: NetworkRequestSurvivalMode;

  constructor(tokenManager: NetworkTokenManager, type: IHandleType) {
    this.pendingTasks = new Map<REQUEST_PRIORITY, RequestTask[]>();
    this.consumers = new Map<NETWORK_VIA, INetworkRequestConsumerListener>();
    this.isPause = false;
    this.type = type;
    this.tokenManager = tokenManager;
    this.init();
  }

  init() {
    this.initPendingTasks();
  }

  initPendingTasks() {
    this.pendingTasks.set(REQUEST_PRIORITY.SPECIFIC, []);
    this.pendingTasks.set(REQUEST_PRIORITY.HIGH, []);
    this.pendingTasks.set(REQUEST_PRIORITY.NORMAL, []);
    this.pendingTasks.set(REQUEST_PRIORITY.LOW, []);
  }

  addApiRequest(request: IRequest, isTail: boolean) {
    if (this.isSurvivalModeEnabled()) {
      if (
        this.isInSurvivalMode() &&
        !this.canHandleInSurvivalMode(request.HAPriority)
      ) {
        this._callXApiResponseCallback(NETWORK_FAIL_TYPE.SERVER_ERROR, request);
        return;
      }
    }
    const task = new RequestTask(request);

    this.appendTask(task, isTail);
    networkLogger.info(
      'addRequestToQueue: ',
      `id:${request.id}`,
      `path:${request.path}`,
      `headers:${JSON.stringify(request.headers)}`,
      `params:${JSON.stringify(request.params)}`,
      `data:${JSON.stringify(request.data)}`,
    );
    this.notifyRequestArrived(request.via);
  }

  pause() {
    this.isPause = true;
  }

  resume() {
    this.isPause = false;
    this.notifyRequestArrived(NETWORK_VIA.ALL);
  }

  cancelAll() {
    this.cancelAllPendingTasks();
    this.cancelAllConsumers();
  }

  cancelRequest(request: IRequest) {
    if (this.isRequestInPending(request)) {
      this.deletePendingRequest(request);
      this._callXApiResponseCallback(NETWORK_FAIL_TYPE.CANCELLED, request);
    } else {
      const consumer = this.consumers.get(request.via);
      if (consumer) {
        consumer.onCancelRequest(request);
      }
    }
  }

  notifyTokenRefreshed() {
    this.consumers.forEach((consumer: INetworkRequestConsumerListener) => {
      consumer.onTokenRefreshed();
    });
  }

  produceRequest(via: NETWORK_VIA): IRequest | undefined {
    let task;
    Object.keys(REQUEST_PRIORITY).some((index: string) => {
      const priority = REQUEST_PRIORITY[index];
      if (!this.canProduceRequest(priority)) {
        return false;
      }
      task = this._nextTaskInQueue(via, this.pendingTasks.get(priority));

      if (task) {
        return true;
      }
      return false;
    });

    if (task) {
      task = task as RequestTask;
      this._changeTaskWeight(
        REQUEST_WEIGHT.HIGH,
        this.pendingTasks.get(REQUEST_PRIORITY.NORMAL),
        this.pendingTasks.get(REQUEST_PRIORITY.HIGH),
      );
      this._changeTaskWeight(
        REQUEST_WEIGHT.NORMAL,
        this.pendingTasks.get(REQUEST_PRIORITY.LOW),
        this.pendingTasks.get(REQUEST_PRIORITY.NORMAL),
      );
      const requestBuilder = task.request as NetworkRequestBuilder;
      requestBuilder.via = via;
      task.request = requestBuilder.build();
      return task.request;
    }

    return undefined;
  }

  hasSpecificRequest(via: NETWORK_VIA): boolean {
    const specificQueue =
      this.pendingTasks.get(REQUEST_PRIORITY.SPECIFIC) || [];
    const task = specificQueue[0];
    if (task && (task.via() === via || task.via() === NETWORK_VIA.ALL)) {
      return true;
    }
    return false;
  }

  canProduceRequest(priority: REQUEST_PRIORITY) {
    return !this.isPause || priority === REQUEST_PRIORITY.SPECIFIC;
  }

  addRequestConsumer(via: NETWORK_VIA, consumer: AbstractConsumer) {
    this.consumers.set(via, consumer);
  }

  getRequestConsumer(via: NETWORK_VIA) {
    return this.consumers.get(via);
  }

  getOAuthTokenManager() {
    return this.tokenManager;
  }

  notifyRequestArrived(handleVia: NETWORK_VIA) {
    if (handleVia === NETWORK_VIA.ALL) {
      this.consumers.forEach((consumer: INetworkRequestConsumerListener) => {
        if (consumer) {
          consumer.onConsumeArrived();
        }
      });
    } else {
      const consumer = this.consumers.get(handleVia);
      if (consumer) {
        consumer.onConsumeArrived();
      }
    }
  }

  appendTask(task: RequestTask, isTail: boolean) {
    const queue = this.pendingTasks.get(task.priority());
    if (queue) {
      if (isTail) {
        queue.push(task);
      } else {
        queue.unshift(task);
      }
      networkLogger.info(
        `appendTask() task priority: ${task.priority()}, pending queue size:${
          queue.length
        }`,
      );
    }
  }

  cancelAllConsumers() {
    this.consumers.forEach((consumer: INetworkRequestConsumerListener) => {
      consumer.onCancelAll();
    });
  }

  cancelAllPendingTasks() {
    this.pendingTasks.forEach((queue: RequestTask[]) => {
      queue.forEach((task: RequestTask) => {
        this._callXApiResponseCallback(
          NETWORK_FAIL_TYPE.CANCELLED,
          task.request,
        );
      });
    });
    this.initPendingTasks();
  }

  isRequestInPending(request: IRequest) {
    let exist = false;
    this.pendingTasks.forEach((queue: RequestTask[]) => {
      queue.some((task: RequestTask) => {
        if (task.request.id === request.id) {
          exist = true;
          return true;
        }
        return false;
      });
      if (exist) {
        return true;
      }
      return false;
    });

    return exist;
  }

  deletePendingRequest(request: IRequest) {
    let exist = false;
    this.pendingTasks.forEach((queue: RequestTask[]) => {
      queue.some((task, index) => {
        if (task.request.id === request.id) {
          exist = true;
          queue.splice(index, 1);
          return true;
        }
        return false;
      });
      if (exist) {
        return true;
      }
      return false;
    });
  }

  setNetworkRequestSurvivalMode(mode: NetworkRequestSurvivalMode) {
    this.networkRequestSurvivalMode = mode;
  }

  isSurvivalModeEnabled() {
    return !!this.networkRequestSurvivalMode;
  }

  isInSurvivalMode() {
    return (
      this.networkRequestSurvivalMode &&
      this.networkRequestSurvivalMode.isSurvivalMode()
    );
  }

  canHandleInSurvivalMode(HAPriority: HA_PRIORITY) {
    return HAPriority === HA_PRIORITY.HIGH;
  }

  onAccessTokenInvalid(handlerType: IHandleType) {
    this.tokenManager.refreshOAuthToken(handlerType);
  }

  onSurvivalModeDetected(mode: SURVIVAL_MODE, retryAfter: number) {
    if (this.isSurvivalModeEnabled() && this.networkRequestSurvivalMode) {
      const interval = retryAfter ? retryAfter * 1000 : 60000;
      this.networkRequestSurvivalMode.setSurvivalMode(mode, interval);
    }
  }

  private _callXApiResponseCallback(
    type: NETWORK_FAIL_TYPE,
    request: IRequest,
  ) {
    const response = HttpResponseBuilder.builder
      .setRequest(request)
      .setStatusText(type)
      .build();
    if (request.callback) {
      request.callback(response);
    }
  }

  private _nextTaskInQueue(
    via: NETWORK_VIA,
    queue?: RequestTask[],
  ): RequestTask | undefined {
    let result;
    if (queue) {
      queue.some((task, index) => {
        if (task.via() === via || task.via() === NETWORK_VIA.ALL) {
          result = task;
          queue.splice(index, 1);
          return true;
        }
        return false;
      });
    }
    return result;
  }

  private _changeTaskWeight(
    weight: number,
    source?: RequestTask[],
    target?: RequestTask[],
  ) {
    if (!source || !target) {
      return;
    }
    let findTask: RequestTask | null = null;
    let taskIndex = -1;
    source.forEach((task, index) => {
      task.incrementTaskWeight();
      if (task.weight >= weight && !findTask) {
        findTask = task;
        taskIndex = index;
      }
    });
    if (findTask !== null) {
      findTask = findTask as RequestTask;
      if (weight === REQUEST_WEIGHT.HIGH) {
        findTask.setRequestPriority(REQUEST_PRIORITY.HIGH);
      } else if (weight === REQUEST_WEIGHT.NORMAL) {
        findTask.setRequestPriority(REQUEST_PRIORITY.NORMAL);
      }
      source.splice(taskIndex, 1);
      target.push(findTask);
    }
  }
}

export default NetworkRequestHandler;
