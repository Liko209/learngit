import { LOG_LEVEL } from './constants';

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

interface ILogEntityDecorator {
  options: object;
  decorate(data: LogEntity): LogEntity;
}

interface ILogCollector {
  onLog(logEntity: LogEntity): void;
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
  level: LOG_LEVEL;
  enabled: boolean;
  filter: (logEntity: LogEntity) => boolean | null;
  browser: {
    enabled: boolean;
  };
  collector: {
    enabled: boolean;
  };
  decorators: ILogEntityDecorator[];
  truncateThreshold: number;
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
  ILogEntityDecorator,
  ILogCollector,
  ILogEntityProcessor,
  IConsoleLogPrettier,
  IAccessor,
  LogEntity,
  LogConfig,
};
