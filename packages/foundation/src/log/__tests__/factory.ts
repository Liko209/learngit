import Factory, { Builder } from 'factory.ts';
import { LogEntity, LogConfig } from '../types';
import { LOG_LEVEL } from '../constants';
const logEntityBuilder: Builder<LogEntity> = {
  id: Factory.each(i => String(i)),
  level: LOG_LEVEL.ALL,
  sessionId: new Date().toDateString(),
  sessionIndex: Factory.each(i => i),
  timestamp: Date.now(),
  params: [],
  userId: 'user1',
  tags: [],
  message: 'hello',
  size: 1024,
};

export const logEntityFactory = Factory.makeFactory(logEntityBuilder);

const logConfigBuilder: Builder<LogConfig> = {
  level: LOG_LEVEL.ALL,
  enabled: true,
  filter: (logEntity: LogEntity) => true,
  browser: {
    enabled: false,
  },
  collector: {
    enabled: true,
  },
  decorators: [],
  truncateThreshold: 1024 * 1024,
};

export const logConfigFactory = Factory.makeFactory(logConfigBuilder);
