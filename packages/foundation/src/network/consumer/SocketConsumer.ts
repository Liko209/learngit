/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-04-03 16:03:22
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractConsumer } from './AbstractConsumer';
import BaseClient from '../client/BaseClient';
import NetworkRequestDecorator from '../NetworkRequestDecorator';
import {
  INetworkRequestProducer,
  NETWORK_VIA,
  IResponseListener,
  CONSUMER_MAX_QUEUE_COUNT,
} from '../network';
import { isOnline } from '../../utils';

class SocketConsumer extends AbstractConsumer {
  constructor(
    producer: INetworkRequestProducer,
    responseListener: IResponseListener,
    client: BaseClient,
    networkRequestDecorator: NetworkRequestDecorator,
  ) {
    super(
      producer,
      responseListener,
      client,
      networkRequestDecorator,
      NETWORK_VIA.SOCKET,
    );
    this.maxQueueCount = CONSUMER_MAX_QUEUE_COUNT.SOCKET;
    this.consumerName = 'Socket';
  }

  protected canHandleRequest() {
    return !this.isRequestExceeded() && !this.shouldWaitForConnecting();
  }

  shouldWaitForConnecting() {
    return !this.client.isNetworkReachable() && isOnline();
  }
}

export { SocketConsumer };
