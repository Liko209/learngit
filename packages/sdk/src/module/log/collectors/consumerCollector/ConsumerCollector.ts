/*
 * @Author: Paynter Chen
 * @Date: 2019-04-13 19:29:40
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogCollector, LogEntity } from 'foundation/log';
import { ILogCollection, ILogConsumer, ILogProducer } from '../types';

const SIZE = 100 * 1024;

export class ConsumerCollector implements ILogCollector, ILogProducer {
  consumer: ILogConsumer;

  constructor(public collection: ILogCollection) {}

  setConsumer(consumer: ILogConsumer) {
    this.consumer = consumer;
    if (this.collection.size() && consumer.canConsume()) {
      consumer.consume(this.collection.pop());
    }
  }

  onLog(logEntity: LogEntity): void {
    if (this.consumer && this.consumer.canConsume()) {
      if (this.collection.size()) {
        this.collection.push(logEntity);
        this.consumer.consume();
      } else {
        this.consumer.consume(logEntity);
      }
    } else {
      this.collection.push(logEntity);
    }
  }

  produce(size?: number): LogEntity[] {
    return this.collection.pop(size || SIZE);
  }
}
