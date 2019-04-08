import { LogManager } from './LogManager';
import { ILogger } from './types';
const logManager = LogManager.getInstance();
const mainLogger: ILogger = logManager.getMainLogger();
const networkLogger: ILogger = logManager.getNetworkLogger();
const telephonyLogger: ILogger = logManager.getTelephonyLogger();

(<any>window).logger = mainLogger;

export { LOG_LEVEL } from './constants';
export { logManager, mainLogger, networkLogger, telephonyLogger };
export * from './types';
