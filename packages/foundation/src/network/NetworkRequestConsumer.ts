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
  IRequest
} from '..';

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
    networkRequestDecorator: NetworkRequestDecorator
  ) {
    this._producer = producer;
    this._client = client;
    this._maxQueueCount = maxQueueCount;
    this._via = via;
    this._responseListener = responseListener;
    this._networkRequestDecorator = networkRequestDecorator;
  }

  onConsumeArrived() {
    this.consume();
  }

  onCancelAll() {
    this._executorQueue.forEach(executor => {
      executor.cancel();
    });
  }

  onCancelRequest(request: IRequest) {
    const executor = this.getExecutor(request.id);
    if (executor) {
      executor.cancel();
    }
  }

  onTokenRefreshed() {
    this._executorQueue.forEach(executor => {
      if (executor.isPause()) {
        executor.execute();
      }
    });
  }

  onConsumeFinished(executor: INetworkRequestExecutor) {
    this.removeExecutor(executor);
    this.consume();
  }

  private consume() {
    if (!this.canHandleRequest()) {
      return;
    }

    const request = this._producer.produceRequest(this._via);

    if (!request) {
      return;
    }

    let executor = new NetworkRequestExecutor(request, this._client);
    executor.responseListener = this._responseListener;
    executor.listener = this;
    const decoratedExecutor = this._networkRequestDecorator.setExecutor(
      executor
    );
    this.addExecutor(decoratedExecutor);
    decoratedExecutor.execute();
  }

  private canHandleRequest() {
    return this._executorQueue.size < this._maxQueueCount;
  }

  private addExecutor(executor: INetworkRequestExecutor) {
    this._executorQueue.set(executor.getRequest().id, executor);
  }

  private removeExecutor(executor: INetworkRequestExecutor) {
    const requestId = executor.getRequest().id;
    this._executorQueue.delete(requestId);
  }

  private getExecutor(requestId: string) {
    return this._executorQueue.get(requestId);
  }
}

export default NetworkRequestConsumer;
