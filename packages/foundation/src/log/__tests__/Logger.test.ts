import { Logger } from '../Logger';
import { LOG_LEVEL } from '../constants';
import { logConfigFactory, logEntityFactory } from './factory';
import { configManager } from '../config';
import { ILogCollector } from '../types';
const mockCollector: ILogCollector = {
  onLog: jest.fn(),
};

describe('Logger', () => {
  beforeAll(() => {
    // mock console for jest
    (global as any)['console'] = {
      clear: jest.fn(),
      count: jest.fn(),
      countReset: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      group: jest.fn(),
      groupCollapsed: jest.fn(),
      groupEnd: jest.fn(),
      info: jest.fn(),
      log: jest.fn(),
      time: jest.fn(),
      timeEnd: jest.fn(),
      timeLog: jest.fn(),
      timeStamp: jest.fn(),
      trace: jest.fn(),
      warn: jest.fn()
    };
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('doLog()', () => {
    it.each`
      methodName | params             | level              | tags
      ${'debug'} | ${['1', '2', '3']} | ${LOG_LEVEL.DEBUG} | ${[]}
      ${'error'} | ${['1', '2', '3']} | ${LOG_LEVEL.ERROR} | ${[]}
      ${'fatal'} | ${['1', '2', '3']} | ${LOG_LEVEL.FATAL} | ${[]}
      ${'info'}  | ${['1', '2', '3']} | ${LOG_LEVEL.INFO}  | ${[]}
      ${'log'}   | ${['1', '2', '3']} | ${LOG_LEVEL.LOG}   | ${[]}
      ${'trace'} | ${['1', '2', '3']} | ${LOG_LEVEL.TRACE} | ${[]}
      ${'warn'}  | ${['1', '2', '3']} | ${LOG_LEVEL.WARN}  | ${[]}
    `(
      'should $methodName call doLog with correct param',
      ({ methodName, params, level, tags }) => {
        const logger = new Logger();
        const mock = jest.spyOn(logger, 'doLog').mockReturnValueOnce(1);
        logger[methodName](...params);
        expect(mock).toBeCalledWith({
          level,
          tags,
          params,
        });
      },
    );

    it.each`
      level              | log      | trace    | debug    | info     | warn     | error    | fatal
      ${LOG_LEVEL.FATAL} | ${false} | ${false} | ${false} | ${false} | ${false} | ${false} | ${true}
      ${LOG_LEVEL.ERROR} | ${false} | ${false} | ${false} | ${false} | ${false} | ${true}  | ${true}
      ${LOG_LEVEL.WARN}  | ${false} | ${false} | ${false} | ${false} | ${true}  | ${true}  | ${true}
      ${LOG_LEVEL.INFO}  | ${false} | ${false} | ${false} | ${true}  | ${true}  | ${true}  | ${true}
      ${LOG_LEVEL.DEBUG} | ${false} | ${false} | ${true}  | ${true}  | ${true}  | ${true}  | ${true}
      ${LOG_LEVEL.TRACE} | ${false} | ${true}  | ${true}  | ${true}  | ${true}  | ${true}  | ${true}
      ${LOG_LEVEL.LOG}   | ${true}  | ${true}  | ${true}  | ${true}  | ${true}  | ${true}  | ${true}
    `(
      'should disabled log when level less than config',
      ({ level, log, trace, debug, info, warn, error, fatal }) => {
        const logger = new Logger();
        const mockFilter = jest.fn();
        configManager.setConfig(
          logConfigFactory.build({
            level,
            filter: mockFilter,
          }),
        );
        logger['log']('hello');
        expect(mockFilter).toBeCalledTimes(log ? 1 : 0);
        mockFilter.mockClear();
        logger['trace']('hello');
        expect(mockFilter).toBeCalledTimes(trace ? 1 : 0);
        mockFilter.mockClear();
        logger['debug']('hello');
        expect(mockFilter).toBeCalledTimes(debug ? 1 : 0);
        mockFilter.mockClear();
        logger['info']('hello');
        expect(mockFilter).toBeCalledTimes(info ? 1 : 0);
        mockFilter.mockClear();
        logger['warn']('hello');
        expect(mockFilter).toBeCalledTimes(warn ? 1 : 0);
        mockFilter.mockClear();
        logger['error']('hello');
        expect(mockFilter).toBeCalledTimes(error ? 1 : 0);
        mockFilter.mockClear();
        logger['fatal']('hello');
        expect(mockFilter).toBeCalledTimes(fatal ? 1 : 0);
        mockFilter.mockClear();
      },
    );
    it('should call filter correctly', () => {
      const logger = new Logger();
      const mockFilter = jest.fn().mockReturnValue(false);
      const mockProcess = jest.spyOn(logger['_logEntityProcessor'], 'process');
      const mockConfig = logConfigFactory.build({
        level: LOG_LEVEL.ALL,
        filter: mockFilter,
      });
      const mockLog = logEntityFactory.build();
      configManager.setConfig(mockConfig);
      logger.doLog(mockLog);
      expect(mockFilter).toBeCalledWith(mockLog);
      expect(mockProcess).toBeCalledTimes(0);
    });
    it('should call ILogEntityProcessor when pass filter [JPT-537]', () => {
      const logger = new Logger();
      const mockProcess = jest
        .spyOn(logger['_logEntityProcessor'], 'process')
        .mockImplementation(item => item);
      logger.addCollector(mockCollector);
      const mockConfig = logConfigFactory.build({
        level: LOG_LEVEL.ALL,
        filter: jest.fn().mockReturnValue(true),
        enabled: true,
        browser: {
          enabled: true,
        },
      });
      const mockLog = logEntityFactory.build();
      configManager.setConfig(mockConfig);
      logger.doLog(mockLog);
      expect(mockProcess).toBeCalledWith(mockLog);
    });
    it('should call browserLogger when config.browser.enabled=true [JPT-1172]', () => {
      const logger = new Logger();
      const spyDoLog = jest.spyOn(logger._consoleLoggerCore, 'doLog');
      const mockLog = logEntityFactory.build({
        level: LOG_LEVEL.LOG,
      });
      // browserEnabled = true
      configManager.setConfig(
        logConfigFactory.build({
          level: LOG_LEVEL.ALL,
          filter: jest.fn().mockReturnValue(true),
          browser: {
            enabled: true,
          },
        }),
      );
      logger.doLog(mockLog);
      expect(spyDoLog).toBeCalledWith(mockLog);
    });
    it('should not call browserLogger when config.browser.enabled=false', () => {
      const logger = new Logger();
      const spyDoLog = jest.spyOn(logger._consoleLoggerCore, 'doLog');
      const mockLog = logEntityFactory.build({
        level: LOG_LEVEL.LOG,
      });
      // browserEnabled = false
      configManager.setConfig(
        logConfigFactory.build({
          level: LOG_LEVEL.ALL,
          filter: jest.fn().mockReturnValue(true),
          browser: {
            enabled: false,
          },
        }),
      );
      logger.doLog(mockLog);
      expect(spyDoLog).toBeCalledTimes(0);
    });
    it('should call consumerLog when config.consumer.enabled=true [JPT-1173]', () => {
      const logger = new Logger();
      const mockProcess = jest
        .spyOn(logger['_logEntityProcessor'], 'process')
        .mockImplementation(item => item);
      logger.addCollector(mockCollector);
      const spyConsumerOnLog = jest.spyOn(mockCollector, 'onLog');
      const mockLog = logEntityFactory.build({
        level: LOG_LEVEL.LOG,
      });
      // consumerEnabled = true
      configManager.setConfig(
        logConfigFactory.build({
          level: LOG_LEVEL.ALL,
          filter: jest.fn().mockReturnValue(true),
        }),
      );
      logger.doLog(mockLog);
      expect(spyConsumerOnLog).toBeCalledWith(mockLog);
    });
    it('should not call consumerLog when config.consumer.enabled=false', () => {
      const logger = new Logger();
      const mockProcess = jest
        .spyOn(logger['_logEntityProcessor'], 'process')
        .mockImplementation(item => item);
      const spyConsumerOnLog = jest.spyOn(mockCollector, 'onLog');
      const mockLog = logEntityFactory.build({
        level: LOG_LEVEL.LOG,
      });

      // consumerEnabled = false
      configManager.setConfig(
        logConfigFactory.build({
          level: LOG_LEVEL.ALL,
          filter: jest.fn().mockReturnValue(true),
        }),
      );
      logger.doLog(mockLog);
      expect(spyConsumerOnLog).toBeCalledTimes(0);
    });

    it('should both consumerLog, browser when config.browser.enabled=true, config.consumer.enabled=true [JPT-1176]', () => {
      const logger = new Logger();
      const mockProcess = jest
        .spyOn(logger['_logEntityProcessor'], 'process')
        .mockImplementation(item => item);
      logger.addCollector(mockCollector);
      const spyConsumerOnLog = jest.spyOn(mockCollector, 'onLog');
      const spyDoLog = jest.spyOn(logger._consoleLoggerCore, 'doLog');
      const mockLog = logEntityFactory.build({
        level: LOG_LEVEL.LOG,
      });
      // consumerEnabled = true
      configManager.setConfig(
        logConfigFactory.build({
          level: LOG_LEVEL.ALL,
          filter: jest.fn().mockReturnValue(true),
          browser: {
            enabled: true,
          },
        }),
      );
      logger.doLog(mockLog);
      expect(spyConsumerOnLog).toBeCalledWith(mockLog);
      expect(spyDoLog).toBeCalledWith(mockLog);
    });
    it('should call consumerLog when config.consumer.enabled=true [JPT-1173]', () => {
      const logger = new Logger();
      const mockProcess = jest
        .spyOn(logger['_logEntityProcessor'], 'process')
        .mockImplementation(item => item);
      logger.addCollector(mockCollector);
      const spyConsumerOnLog = jest.spyOn(mockCollector, 'onLog');
      const mockLog = logEntityFactory.build({
        level: LOG_LEVEL.LOG,
      });
      // consumerEnabled = true
      configManager.setConfig(
        logConfigFactory.build({
          level: LOG_LEVEL.ALL,
          filter: jest.fn().mockReturnValue(true),
        }),
      );
      logger.doLog(mockLog);
      expect(spyConsumerOnLog).toBeCalledWith(mockLog);
    });
    it('should ignore browser.enabled, when loglevel>=warning [JPT-1171]', () => {
      const logger = new Logger();
      const mockProcess = jest
        .spyOn(logger['_logEntityProcessor'], 'process')
        .mockImplementation(item => item);
      logger.addCollector(mockCollector);
      const spyDoLog = jest.spyOn(logger._consoleLoggerCore, 'doLog');
      const mockLog = logEntityFactory.build({
        level: LOG_LEVEL.WARN,
      });

      // browserEnabled = false
      configManager.setConfig(
        logConfigFactory.build({
          level: LOG_LEVEL.ALL,
          filter: jest.fn().mockReturnValue(true),
          browser: {
            enabled: false,
          },
        }),
      );
      logger.doLog(mockLog);
      expect(spyDoLog).toBeCalledTimes(1);
    });
    it('Log prettier format should correct [JPT-538]', () => {
      const logger = new Logger();
      const mockPrettier = jest
        .spyOn(logger['_consoleLoggerCore']['_consoleLogPrettier'], 'prettier')
        .mockImplementation(item => item.params);
      configManager.setConfig(
        logConfigFactory.build({
          level: LOG_LEVEL.ALL,
          filter: jest.fn().mockReturnValue(true),
          browser: {
            enabled: true,
          },
        }),
      );
      const mockLog = logEntityFactory.build();
      logger.doLog(mockLog);
      expect(mockPrettier).toBeCalledWith(mockLog);
    });
  });

  describe('tags()', () => {
    it.each`
      methodName | params             | level              | tags
      ${'debug'} | ${['1', '2', '3']} | ${LOG_LEVEL.DEBUG} | ${['d1', 't1']}
      ${'error'} | ${['1', '2', '3']} | ${LOG_LEVEL.ERROR} | ${['d1', 't1']}
      ${'fatal'} | ${['1', '2', '3']} | ${LOG_LEVEL.FATAL} | ${['d1', 't1']}
      ${'info'}  | ${['1', '2', '3']} | ${LOG_LEVEL.INFO}  | ${['d1', 't1']}
      ${'log'}   | ${['1', '2', '3']} | ${LOG_LEVEL.LOG}   | ${['d1', 't1']}
      ${'trace'} | ${['1', '2', '3']} | ${LOG_LEVEL.TRACE} | ${['d1', 't1']}
      ${'warn'}  | ${['1', '2', '3']} | ${LOG_LEVEL.WARN}  | ${['d1', 't1']}
    `('should wrap logger with tags', ({ methodName, params, level, tags }) => {
      const logger = new Logger();
      configManager.setConfig(logConfigFactory.build({}));
      const loggerWrapper = logger.tags(...tags);
      const mock = jest.spyOn(logger, 'doLog').mockReturnValueOnce(1);
      loggerWrapper[methodName](...params);
      expect(mock).toBeCalledWith({
        level,
        tags,
        params,
      });
    });
  });
  describe('addConsumer()', () => {
    it('should set consumer.', () => {
      const logger = new Logger();
      logger.addCollector(mockCollector);
      expect(logger['_logCollectors']).toEqual([mockCollector]);
    });
  });
  describe('addConsumer()', () => {
    it('should add consumer.', () => {
      const logger = new Logger();
      logger.addCollector(mockCollector);
      expect(logger['_logCollectors'].length).toEqual(1);
      logger.addCollector(mockCollector);
      expect(logger['_logCollectors'].length).toEqual(2);
    });
  });
});
