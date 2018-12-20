import { LOG_LEVEL } from './constants';

interface ILogger {
  tags(...tags: string[]): ILogger;
  trace(message: string): void;
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  fatal(message: string): void;
  doLog(logEntity: LogEntity): void;
}

interface ILogFilter {
  preProcessFilter(logEntity: LogEntity): boolean;
  isBrowserEnable(logEntity: LogEntity): boolean;
  isConsumerEnable(logEntity: LogEntity): boolean;
}

interface ILoader<T> {
  handle(data: T): T;
}

interface ILogConsumer {
  onLog(logEntity: LogEntity): Promise<void>;
}

interface ILogEntityProcessor {
  process(logEntity: LogEntity): LogEntity;
}

type onAccessibleChange = (accessible: boolean) => void;

interface IAccessor {
  isAccessible(): boolean;
  subscribe(onChange: onAccessibleChange): void;
}

interface IDeque<E> {
  addHead(e: E): void;
  peekHead(): E;
  getHead(): E;
  addTail(e: E): void;
  peekTail(): E;
  getTail(): E;
  peekAll(): E[];
  size(): number;
}

interface IQueueLoop {
  loop(): Promise<void>;
  isAvailable(): boolean;
  sleep(timeout: number): void;
  wake(): void;
}

type TaskErrorHandler = {
  retry: () => Promise<void>,
  ignore: () => Promise<void>,
  abort: () => Promise<void>,
  abortAll: () => Promise<void>,
  sleep: (timeout: number) => void,
};

type TaskCompletedHandler = {
  next: () => Promise<void>,
  abortAll: () => Promise<void>,
  sleep: (timeout: number) => void,
};

type LoopController = {
  onTaskError: (error: Error, handler: TaskErrorHandler) => Promise<void>,
  onTaskCompleted: (handler: TaskCompletedHandler) => Promise<void>,
  onLoopCompleted: () => Promise<void>,
};

class LogEntity {
  id: string;
  level: LOG_LEVEL;
  userId: string;
  tags: string[];
  sessionId: string;
  sessionIndex: number;
  timestamp: number;
  params: any[];
  message: string;
  size: number;
}

export {
  ILogger,
  ILoader,
  ILogConsumer,
  ILogEntityProcessor,
  ILogFilter,
  IDeque,
  IAccessor,
  IQueueLoop,
  LoopController,
  TaskErrorHandler,
  TaskCompletedHandler,
  LogEntity,
};
