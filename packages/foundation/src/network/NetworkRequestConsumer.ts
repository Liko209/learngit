/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:42:03
 * Copyright © RingCentral. All rights reserved.
 */
import BaseClient from './client/BaseClient';
import { NetworkRequestExecutor } from './NetworkRequestExecutor';
import NetworkRequestDecorator from './NetworkRequestDecorator';
import {
  INetworkRequestConsumerListener,
  INetworkRequestProducer,
  NETWORK_VIA,
  INetworkRequestExecutor,
  IResponseListener,
  IRequest,
} from './network';
import { networkLogger } from '../log';

const LOG_TAG = 'NetworkRequestConsumer';
class NetworkRequestConsumer implements INetworkRequestConsumerListener {
  private _producer: INetworkRequestProducer;
  private _client: BaseClient;
  private _maxQueueCount: number;
  private _via: NETWORK_VIA;
  private _executorQueue: Map<string, INetworkRequestExecutor> = new Map();
  private _responseListener: IResponseListener;
  private _networkRequestDecorator: NetworkRequestDecorator;

  constructor(
    producer: INetworkRequestProducer,
    client: BaseClient,
    maxQueueCount: number,
    via: NETWORK_VIA,
    responseListener: IResponseListener,
    networkRequestDecorator: NetworkRequestDecorator,
  ) {
    this._producer = producer;
    this._client = client;
    this._maxQueueCount = maxQueueCount;
    this._via = via;
    this._responseListener = responseListener;
    this._networkRequestDecorator = networkRequestDecorator;
  }

  onConsumeArrived() {
    this._consume();
  }

  onCancelAll() {
    this._executorQueue.forEach((executor: INetworkRequestExecutor) => {
      executor.cancel();
    });
  }

  onCancelRequest(request: IRequest) {
    const executor = this._getExecutor(request.id);
    if (executor) {
      executor.cancel();
    }
  }

  onTokenRefreshed() {
    this._executorQueue.forEach((executor: INetworkRequestExecutor) => {
      if (executor.isPause()) {
        executor.execute();
      }
    });
  }

  onConsumeFinished(executor: INetworkRequestExecutor) {
    this._removeExecutor(executor);
    this._consume();
  }

  private _consume() {
    if (!this._canHandleRequest()) {
      return;
    }

    const request = this._producer.produceRequest(this._via);

    if (!request) {
      return;
    }
    const executor = new NetworkRequestExecutor(
      request,
      this._client,
      this._networkRequestDecorator.decoration,
    );
    executor.responseListener = this._responseListener;
    executor.listener = this;
    this._addExecutor(executor);
    executor.execute();
  }

  private _canHandleRequest() {
    networkLogger.info(
      LOG_TAG,
      `_canHandleRequest queue size: ${this._executorQueue.size}, via: ${
        this._via
      }`,
    );
    return (
      this._client.isNetworkReachable() &&
      this._executorQueue.size < this._maxQueueCount
    );
  }

  private _addExecutor(executor: INetworkRequestExecutor) {
    this._executorQueue.set(executor.getRequest().id, executor);
  }

  private _removeExecutor(executor: INetworkRequestExecutor) {
    const requestId = executor.getRequest().id;
    this._executorQueue.delete(requestId);
  }

  private _getExecutor(requestId: string) {
    return this._executorQueue.get(requestId);
  }
}

export default NetworkRequestConsumer;
