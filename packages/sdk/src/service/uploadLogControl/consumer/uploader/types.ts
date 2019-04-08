/*
 * @Author: Paynter Chen
 * @Date: 2019-03-24 11:08:37
 * Copyright © RingCentral. All rights reserved.
 */
import { LogEntity } from 'foundation/src/log/types';
interface ILogUploader {
  upload(logs: LogEntity[]): Promise<void>;

  errorHandler(error: Error): 'ignore' | 'retry' | 'abort' | 'abortAll';
}

export { ILogUploader };
