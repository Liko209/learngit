import LogManager from './LogManager';
import emitter from './emitter';
import Logger from './Logger';

const logManager = LogManager.Instance;
const mainLogger: Logger = logManager.getMainLogger();
const networkLogger: Logger = logManager.getNetworkLogger();

emitter.on('doAppend', (overThreshold) => {
  logManager.doAppend(overThreshold);
});

export { LOG_LEVEL } from './constants';
export { logManager, mainLogger, networkLogger };
