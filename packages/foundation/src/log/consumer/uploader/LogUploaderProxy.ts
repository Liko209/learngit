import { ILogUploader } from './types';
import { LogEntity } from '../../types';
import { configManager } from '../../config';
import { NO_INJECT_ERROR } from '../../constants';

export class LogUploaderProxy implements ILogUploader {
  async upload(logs: LogEntity[]): Promise<void> {
    const logUploader = configManager.getConfig().logUploader;
    if (logUploader) {
      return await logUploader.upload(logs);
    }
    throw new Error(NO_INJECT_ERROR);
  }

  errorHandler(error: Error) {
    if (error.message === NO_INJECT_ERROR) {
      return 'retry';
    }
    return (<ILogUploader>configManager.getConfig().logUploader).errorHandler(
      error,
    );
  }
}
