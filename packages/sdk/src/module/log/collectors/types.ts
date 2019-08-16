/*
 * @Author: Paynter Chen
 * @Date: 2019-04-14 07:46:09
 * Copyright © RingCentral. All rights reserved.
 */
import { LogEntity } from 'foundation/log';

interface ILogProducer {
  produce(size?: number): LogEntity[];
}

interface ILogConsumer {
  logProducer: ILogProducer;
  consume(log?: LogEntity | LogEntity[]): void;
  canConsume(): boolean;
}

interface ILogCollection {
  push(logEntity: LogEntity): void;
  pop(limit?: number): LogEntity[];
  popAll(): LogEntity[];
  get(limit?: number): LogEntity[];
  size(): number;
}

export { ILogCollection };

export { ILogProducer, ILogConsumer };
