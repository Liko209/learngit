/*
 * @Author: Paynter Chen
 * @Date: 2019-04-13 19:29:35
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogCollector, LogEntity } from 'foundation';
import { ILogCollection, ILogConsumer, ILogProducer } from '../types';

const SIZE = 100 * 1024;

export class LogMemoryCollector implements ILogCollector, ILogProducer {
  consumer: ILogConsumer;

  constructor(public collection: ILogCollection) {}

  setConsumer(consumer: ILogConsumer) {
    this.consumer = consumer;
  }

  onLog(logEntity: LogEntity): void {
    this.collection.push(logEntity);
    this.consumer && this.consumer.canConsume() && this.consumer.consume();
  }

  produce(): LogEntity[] {
    return this.collection.pop(SIZE);
  }

  getCollection(): ILogCollection {
    return this.collection;
  }
}
