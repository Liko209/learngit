import { logManager, networkLogger, LOG_LEVEL } from '../index';

describe('Log', () => {
  afterEach(() => {
    logManager.clearLogs();
  });

  describe('LogManager', () => {
    it('getLogs() if there is a the mainLogger and networkLogger', async () => {
      expect.hasAssertions();
      await expect(logManager.getLogs()).resolves.toHaveProperty('MAIN');
      await expect(logManager.getLogs()).resolves.toHaveProperty('NETWORK');
    });
    it('level set to OFF should return 0 log', async () => {
      expect.hasAssertions();
      networkLogger.setLevel(LOG_LEVEL.OFF);
      networkLogger.trace('');
      networkLogger.debug('');
      networkLogger.info('');
      networkLogger.warn('');
      networkLogger.error('');
      networkLogger.fatal('');
      const logs = await logManager.getLogs();
      expect(logs.NETWORK).toHaveLength(0);
    });
    it('level set to ALL should return 6 logs', async () => {
      expect.hasAssertions();
      networkLogger.setLevel(LOG_LEVEL.ALL);
      networkLogger.trace('');
      networkLogger.debug('');
      networkLogger.info('');
      networkLogger.warn('');
      networkLogger.error('');
      networkLogger.fatal('');
      logManager.doAppend();
      const logs = await logManager.getLogs();
      expect(logs.NETWORK).toHaveLength(6);
    });
    it('level set to TRACE should return 6 logs', async () => {
      expect.hasAssertions();
      networkLogger.setLevel(LOG_LEVEL.TRACE);
      networkLogger.trace('');
      networkLogger.debug('');
      networkLogger.info('');
      networkLogger.warn('');
      networkLogger.error('');
      networkLogger.fatal('');
      logManager.doAppend();
      const logs = await logManager.getLogs();
      expect(logs.NETWORK).toHaveLength(6);
    });
    it('level set to DEBUG should return 5 logs', async () => {
      expect.hasAssertions();
      networkLogger.setLevel(LOG_LEVEL.DEBUG);
      networkLogger.trace('');
      networkLogger.debug('');
      networkLogger.info('');
      networkLogger.warn('');
      networkLogger.error('');
      networkLogger.fatal('');
      logManager.doAppend();
      const logs = await logManager.getLogs();
      expect(logs.NETWORK).toHaveLength(5);
    });
    it('level set to INFO should return 4 logs', async () => {
      expect.hasAssertions();
      networkLogger.setLevel(LOG_LEVEL.INFO);
      networkLogger.trace('');
      networkLogger.debug('');
      networkLogger.info('');
      networkLogger.warn('');
      networkLogger.error('');
      networkLogger.fatal('');
      logManager.doAppend();
      const logs = await logManager.getLogs();
      expect(logs.NETWORK).toHaveLength(4);
    });
    it('level set to WARN should return 3 logs', async () => {
      expect.hasAssertions();
      networkLogger.setLevel(LOG_LEVEL.WARN);
      networkLogger.trace('');
      networkLogger.debug('');
      networkLogger.info('');
      networkLogger.warn('');
      networkLogger.error('');
      networkLogger.fatal('');
      logManager.doAppend();
      const logs = await logManager.getLogs();
      expect(logs.NETWORK).toHaveLength(3);
    });
    it('level set to ERROR should return 2 logs', async () => {
      expect.hasAssertions();
      networkLogger.setLevel(LOG_LEVEL.ERROR);
      networkLogger.trace('');
      networkLogger.debug('');
      networkLogger.info('');
      networkLogger.warn('');
      networkLogger.error('');
      networkLogger.fatal('');
      logManager.doAppend();
      const logs = await logManager.getLogs();
      expect(logs.NETWORK).toHaveLength(2);
    });
    it('level set to FATAL should return 1 log', async () => {
      expect.hasAssertions();
      networkLogger.setLevel(LOG_LEVEL.FATAL);
      networkLogger.trace('');
      networkLogger.debug('');
      networkLogger.info('');
      networkLogger.warn('');
      networkLogger.error('');
      networkLogger.fatal('');
      logManager.doAppend();
      const logs = await logManager.getLogs();
      expect(logs.NETWORK).toHaveLength(1);
    });
  });

  it('clearLogs() should return 0 log', async () => {
    expect.hasAssertions();
    networkLogger.setLevel(LOG_LEVEL.ALL);
    networkLogger.trace('');
    networkLogger.debug('');
    networkLogger.info('');
    networkLogger.warn('');
    networkLogger.error('');
    networkLogger.fatal('');
    logManager.doAppend();
    const fristLogs = await logManager.getLogs();
    expect(fristLogs.NETWORK).toHaveLength(6);

    await logManager.clearLogs();
    const lastLogs = await logManager.getLogs();
    expect(lastLogs.NETWORK).toHaveLength(0);
  });
  it('doAppend() with overThreshould, should callback', async () => {
    let hasBeenCalled = false;
    logManager.setOverThresholdCallback(() => {
      hasBeenCalled = true;
    });
    await logManager.doAppend(true);
    expect(hasBeenCalled).toBe(true);
  });
});
