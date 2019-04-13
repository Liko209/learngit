/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:06:23
 * Copyright © RingCentral. All rights reserved.
 */
import { LogEntity } from 'foundation';

export type LogConsumerConfig = {
  uploadEnabled: boolean;
  memoryCountThreshold: number;
  memorySizeThreshold: number;
  uploadQueueLimit: number;
  autoFlushTimeCycle: number;
  combineSizeThreshold: number;
  persistentLimit: number;
  memoryCacheSizeThreshold: number;
};

type onAccessibleChange = (accessible: boolean) => void;
interface IAccessor {
  isAccessible(): boolean;
  subscribe(onChange: onAccessibleChange): void;
}
interface ILogCollection {
  push(logEntity: LogEntity): void;
  pop(limit?: number): LogEntity[];
  get(limit?: number): LogEntity[];
  size(): number;
}

interface ILogProducer {
  produce(size?: number): LogEntity[];
}

interface ILogConsumer {
  logProducer: ILogProducer;
  consume(log?: LogEntity | LogEntity[]): void;
  canConsume(): boolean;
}
export { ILogCollection, ILogProducer, ILogConsumer, IAccessor };
