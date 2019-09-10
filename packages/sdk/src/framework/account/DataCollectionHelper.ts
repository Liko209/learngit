/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-25 10:45:58
 * Copyright © RingCentral. All rights reserved.
 */

import { getCurrentTime } from 'sdk/utils/jsUtils';
import { traceData } from 'sdk/api/glip/dataCollection';
import { mainLogger } from 'foundation/log';
import {
  DataCollectionSignInSuccessModel,
  DataCollectionSignInFailureDetailsModel,
  DataCollectionTraceLoginSuccessModel,
} from './types';
import { IDataCollectionHelper } from './IDataCollectionHelper';
import { EnvConfig } from 'sdk/module/env/config';

class DataCollectionHelper implements IDataCollectionHelper {
  private _isProduction: boolean = false;
  public setIsProductionAccount(isProduction: boolean) {
    this._isProduction = isProduction;
  }

  public isProduction() {
    return this._isProduction;
  }

  async traceLoginFailed(accountType: string, reason: string) {
    const common = this._getLoginStatusCommonProperties(accountType, false);
    const model: DataCollectionSignInFailureDetailsModel = common;
    Object.assign(model.event.details, {
      error: {
        message: reason,
        code: 'invalid_login',
      },
    });
    this._collectData(model);
  }

  async traceLoginSuccess(info: DataCollectionTraceLoginSuccessModel) {
    const common = this._getLoginStatusCommonProperties(info.accountType, true);
    const model: DataCollectionSignInSuccessModel = common;
    Object.assign(model.event.details, {
      user_id: info.userId,
      company_id: info.companyId,
    });
    this._collectData(model);
  }

  private _getLoginStatusCommonProperties(
    accountType: string,
    isSuccess: boolean,
  ) {
    return {
      event: {
        type: isSuccess ? 'success' : 'failure',
        timestamp: getCurrentTime(),
        details: {
          feature: 'authentication',
          build_type: this.isProduction() ? 'prod' : 'non_prod',
          account_type: accountType,
        },
      },
    };
  }

  private _collectData(model: object) {
    try {
      const isRunningE2E = EnvConfig.getIsRunningE2E();
      !isRunningE2E && traceData(model);
    } catch (e) {
      mainLogger.log('trace data error:', e);
    }
  }
}

const dataCollectionHelper = new DataCollectionHelper();
export { dataCollectionHelper, DataCollectionHelper };
