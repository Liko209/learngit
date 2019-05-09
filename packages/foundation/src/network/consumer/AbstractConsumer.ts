/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-03 15:15:27
 * Copyright © RingCentral. All rights reserved.
 */

import BaseClient from '../client/BaseClient';
import { NetworkRequestExecutor } from '../NetworkRequestExecutor';
import NetworkRequestDecorator from '../NetworkRequestDecorator';
import {
  INetworkRequestConsumerListener,
  INetworkRequestProducer,
  NETWORK_VIA,
  INetworkRequestExecutor,
  IResponseListener,
  IRequest,
} from '../network';
import { networkLogger } from '../../log';

abstract class AbstractConsumer implements INetworkRequestConsumerListener {
  private _producer: INetworkRequestProducer;
  private _via: NETWORK_VIA;
  private _executorQueue: Map<string, INetworkRequestExecutor> = new Map();
  private _responseListener: IResponseListener;
  private _networkRequestDecorator: NetworkRequestDecorator;
  protected client: BaseClient;
  protected maxQueueCount: number;
  protected consumerName: string;

  constructor(
    producer: INetworkRequestProducer,
    responseListener: IResponseListener,
    client: BaseClient,
    networkRequestDecorator: NetworkRequestDecorator,
    via: NETWORK_VIA,
  ) {
    this._producer = producer;
    this._responseListener = responseListener;
    this.client = client;
    this._networkRequestDecorator = networkRequestDecorator;
    this._via = via;
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
    if (!this.canHandleRequest()) {
      return;
    }

    const request = this._producer.produceRequest(
      this._via,
      this.client.isNetworkReachable(),
    );
    if (!request) {
      return;
    }
    const executor = new NetworkRequestExecutor(
      request,
      this.client,
      this._networkRequestDecorator.decoration,
    );
    executor.responseListener = this._responseListener;
    executor.listener = this;
    this._addExecutor(executor);
    executor.execute();
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

  protected isRequestExceeded() {
    networkLogger.info(
      this.consumerName,
      `executor queue size: ${this._executorQueue.size}`,
    );
    return this._executorQueue.size >= this.maxQueueCount;
  }

  protected abstract canHandleRequest(): boolean;
}

export { AbstractConsumer };
