import { LOG_LEVEL } from './constants';
import { ILogApi } from './consumer';
import { ILogPersistence } from './consumer/persistence';

interface ILogger {
  tags(...tags: string[]): ILogger;
  log(...params: any): void;
  trace(...params: any): void;
  debug(...params: any): void;
  info(...params: any): void;
  warn(...params: any): void;
  error(...params: any): void;
  fatal(...params: any): void;
}

interface ILoggerCore {
  doLog(logEntity: LogEntity): void;
}

interface ILogLoader {
  options: object;
  handle(data: LogEntity): LogEntity;
}

interface ILogConsumer {
  onLog(logEntity: LogEntity): Promise<void>;
  flush(): Promise<void>;
}

interface ILogEntityProcessor {
  process(logEntity: LogEntity): LogEntity;
}

type onAccessibleChange = (accessible: boolean) => void;

interface IAccessor {
  isAccessible(): boolean;
  subscribe(onChange: onAccessibleChange): void;
}

interface IConsoleLogPrettier {
  prettier(logEntity: LogEntity): any[];
}

type LogConfig = {
  level: LOG_LEVEL,
  enabled: boolean,
  filter: (logEntity: LogEntity) => boolean | null,
  browser: {
    enabled: boolean,
  },
  consumer: {
    enabled: boolean,
    memoryCountThreshold: number,
    memorySizeThreshold: number,
    uploadQueueLimit: number,
    autoFlushTimeCycle: number,
  },
  uploadLogApi: ILogApi | null,
  persistence: ILogPersistence | null,
  uploadAccessor: IAccessor | null,
  loaders: ILogLoader[],
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
  ILoggerCore,
  ILogLoader,
  ILogConsumer,
  ILogEntityProcessor,
  IConsoleLogPrettier,
  IAccessor,
  LogEntity,
  LogConfig,
};
