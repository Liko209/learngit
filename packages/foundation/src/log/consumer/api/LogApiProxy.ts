import { ILogApi } from './types';
import { LogEntity } from '../../types';
import { configManager } from '../../config';
import { NO_INJECT_ERROR } from '../../constants';

export class LogApiProxy implements ILogApi {
  upload(logs: LogEntity[]): Promise<any> {
    const uploadLogApi = configManager.getConfig().uploadLogApi;
    if (uploadLogApi) {
      return uploadLogApi.upload(logs);
    }
    throw new Error(NO_INJECT_ERROR);
  }

}
