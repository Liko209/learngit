import { ILogCollector, LogEntity } from 'foundation';
import { ILogCollection, ILogConsumer, ILogProducer } from './consumer/types';

const SIZE = 100 * 1024;

export class LogCollector implements ILogCollector, ILogProducer {
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
    console.log(
      'TCL: LogCollector -> constructor -> this.collection',
      this.collection,
    );
    return this.collection.pop(SIZE);
  }

  getCollection(): ILogCollection {
    return this.collection;
  }
}
