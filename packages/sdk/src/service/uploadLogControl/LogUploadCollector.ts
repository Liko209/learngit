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
    console.log(
      'TCL: LogCollector -> constructor -> this.collection',
      this.collection,
    );
    return this.collection.pop(size || SIZE);
  }

  getCollection(): ILogCollection {
    return this.collection;
  }
}
