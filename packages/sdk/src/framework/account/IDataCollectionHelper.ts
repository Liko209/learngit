/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-29 13:17:08
 * Copyright © RingCentral. All rights reserved.
 */
import { DataCollectionTraceLoginSuccessModel } from './types';

interface IDataCollectionHelper {
  setIsProductionAccount(isProduction: true): void;
  isProduction(): boolean;
  traceLoginFailed(accountType: string, reason: string): Promise<void>;
  traceLoginSuccess(info: DataCollectionTraceLoginSuccessModel): Promise<void>;
}

export { IDataCollectionHelper };
