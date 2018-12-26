import { Logger } from '../Logger';
import { LOG_LEVEL } from '../constants';
import { logConfigFactory, logEntityFactory, consumerConfigFactory } from './factory';
import { LogConsumer } from '../consumer';
import { configManager } from '../config';
describe('Logger', () => {

  describe('doLog()', () => {
    it.each`
    methodName  | params             |  level              | tags
    ${'debug'}  | ${['1', '2', '3']} |  ${LOG_LEVEL.DEBUG} | ${[]}
    ${'error'}  | ${['1', '2', '3']} |  ${LOG_LEVEL.ERROR} | ${[]}
    ${'fatal'}  | ${['1', '2', '3']} |  ${LOG_LEVEL.FATAL} | ${[]}
    ${'info'}   | ${['1', '2', '3']} |  ${LOG_LEVEL.INFO}  | ${[]}
    ${'log'}    | ${['1', '2', '3']} |  ${LOG_LEVEL.LOG}   | ${[]}
    ${'trace'}  | ${['1', '2', '3']} |  ${LOG_LEVEL.TRACE} | ${[]}
    ${'warn'}   | ${['1', '2', '3']} |  ${LOG_LEVEL.WARN}  | ${[]}
    `('should $methodName call doLog with correct param',
      ({ methodName, params, level, tags }) => {
        const logger = new Logger();
        // logger.applyConfig(logConfigFactory.build({}));
        const mock = jest.spyOn(logger, 'doLog').mockReturnValueOnce(1);
        logger[methodName](...params);
        expect(mock).toBeCalledWith({
          level,
          tags,
          params,
        });
      });

    it.each`
    level              | log      | trace    | debug    | info     | warn     | error    | fatal
    ${LOG_LEVEL.FATAL} | ${false} | ${false} | ${false} | ${false} | ${false} | ${false} | ${true}
    ${LOG_LEVEL.ERROR} | ${false} | ${false} | ${false} | ${false} | ${false} | ${true}  | ${true}
    ${LOG_LEVEL.WARN}  | ${false} | ${false} | ${false} | ${false} | ${true}  | ${true}  | ${true}
    ${LOG_LEVEL.INFO}  | ${false} | ${false} | ${false} | ${true}  | ${true}  | ${true}  | ${true}
    ${LOG_LEVEL.DEBUG} | ${false} | ${false} | ${true}  | ${true}  | ${true}  | ${true}  | ${true}
    ${LOG_LEVEL.TRACE} | ${false} | ${true}  | ${true}  | ${true}  | ${true}  | ${true}  | ${true}
    ${LOG_LEVEL.LOG}   | ${true}  | ${true}  | ${true}  | ${true}  | ${true}  | ${true}  | ${true}
    `('should disabled log when level less than config',
      ({ level, log, trace, debug, info, warn, error, fatal }) => {
        const logger = new Logger();
        const mockFilter = jest.fn();
        configManager.setConfig(logConfigFactory.build({
          level,
          filter: mockFilter,
        }));
        // logger.applyConfig();
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
      });
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
      const mockProcess = jest.spyOn(logger['_logEntityProcessor'], 'process')
        .mockImplementation(item => item);
      const mockConsumer = new LogConsumer();
      logger.setConsumer(mockConsumer);
      const mockConfig = logConfigFactory.build({
        level: LOG_LEVEL.ALL,
        filter: jest.fn().mockReturnValue(true),
      });
      const mockLog = logEntityFactory.build();
      configManager.setConfig(mockConfig);
      logger.doLog(mockLog);
      expect(mockProcess).toBeCalledWith(mockLog);
    });
    it('should config.consumer.enabled work', () => {
      const logger = new Logger();
      const mockProcess = jest.spyOn(logger['_logEntityProcessor'], 'process')
        .mockImplementation(item => item);
      const mockConsumer = new LogConsumer();
      logger.setConsumer(mockConsumer);
      const spyConsumerOnLog = jest.spyOn(mockConsumer, 'onLog');
      const mockLog = logEntityFactory.build();
      // consumerEnabled = true
      configManager.setConfig(logConfigFactory.build({
        level: LOG_LEVEL.ALL,
        filter: jest.fn().mockReturnValue(true),
        consumer: consumerConfigFactory.build({
          enabled: true,
        }),
      }));
      logger.doLog(mockLog);
      expect(spyConsumerOnLog).toBeCalledWith(mockLog);

      // consumerEnabled = false
      configManager.setConfig(logConfigFactory.build({
        level: LOG_LEVEL.ALL,
        filter: jest.fn().mockReturnValue(true),
        consumer: consumerConfigFactory.build({
          enabled: false,
        }),
      }));
      logger.doLog(mockLog);
      spyConsumerOnLog.mockClear();
      expect(spyConsumerOnLog).toBeCalledTimes(0);
    });
    it('Log prettier format should correct [JPT-538]', () => {
      const logger = new Logger();
      const mockPrettier = jest.spyOn(logger['_consoleLogPrettier'], 'prettier')
        .mockImplementation(item => item.params);
      const mockConsumer = new LogConsumer();
      logger.setConsumer(mockConsumer);
      // consumerEnabled = false
      configManager.setConfig(logConfigFactory.build({
        level: LOG_LEVEL.ALL,
        filter: jest.fn().mockReturnValue(true),
        consumer: consumerConfigFactory.build({
          enabled: false,
        }),
        browser: {
          enabled: true,
        },
      }));
      const mockLog = logEntityFactory.build();
      logger.doLog(mockLog);
      expect(mockPrettier).toBeCalledWith(mockLog);
    });
  });

  describe('tags()', () => {
    it.each`
    methodName  | params             |  level              | tags
    ${'debug'}  | ${['1', '2', '3']} |  ${LOG_LEVEL.DEBUG} | ${['d1', 't1']}
    ${'error'}  | ${['1', '2', '3']} |  ${LOG_LEVEL.ERROR} | ${['d1', 't1']}
    ${'fatal'}  | ${['1', '2', '3']} |  ${LOG_LEVEL.FATAL} | ${['d1', 't1']}
    ${'info'}   | ${['1', '2', '3']} |  ${LOG_LEVEL.INFO}  | ${['d1', 't1']}
    ${'log'}    | ${['1', '2', '3']} |  ${LOG_LEVEL.LOG}   | ${['d1', 't1']}
    ${'trace'}  | ${['1', '2', '3']} |  ${LOG_LEVEL.TRACE} | ${['d1', 't1']}
    ${'warn'}   | ${['1', '2', '3']} |  ${LOG_LEVEL.WARN}  | ${['d1', 't1']}
    `('should wrap logger with tags',
      ({ methodName, params, level, tags }) => {
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

});
