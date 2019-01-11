import LogManager from './LogManager';
import { ILogger } from './types';
const logManager = LogManager.Instance;
const mainLogger: ILogger = logManager.getMainLogger();
const networkLogger: ILogger = logManager.getNetworkLogger();

(<any>window).logger = mainLogger;

export { LOG_LEVEL } from './constants';
export { logManager, mainLogger, networkLogger };
export * from './types';
export * from './consumer';
