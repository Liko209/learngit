/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-28 21:57:59
 * Copyright © RingCentral. All rights reserved.
 */

import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { CallLogActionController } from './CallLogActionController';
import { AllCallLogFetchController } from './AllCallLogFetchController';
import { MissedCallLogFetchController } from './MissedCallLogFetchController';
import { CallLog } from '../entity';
import { RCItemUserConfig } from '../../config';
import { CallLogBadgeController } from './CallLogBadgeController';

class CallLogController {
  private _callLogActionController: CallLogActionController;
  private _allCallLogFetchController: AllCallLogFetchController;
  private _missedCallLogFetchController: MissedCallLogFetchController;
  private _callLogBadgeController: CallLogBadgeController;
  constructor(
    private _entitySourceController: IEntitySourceController<CallLog, string>,
    private _userConfig: RCItemUserConfig,
    private _missedCallUserConfig: RCItemUserConfig,
  ) {}

  get callLogActionController() {
    if (!this._callLogActionController) {
      this._callLogActionController = new CallLogActionController(
        this._entitySourceController,
      );
    }

    return this._callLogActionController;
  }

  get allCallLogFetchController() {
    if (!this._allCallLogFetchController) {
      this._allCallLogFetchController = new AllCallLogFetchController(
        this._userConfig,
        this._entitySourceController,
        this.callLogBadgeController,
      );
    }

    return this._allCallLogFetchController;
  }

  get missedCallLogFetchController() {
    if (!this._missedCallLogFetchController) {
      this._missedCallLogFetchController = new MissedCallLogFetchController(
        this._missedCallUserConfig,
        this._entitySourceController,
        this.callLogBadgeController,
      );
    }

    return this._missedCallLogFetchController;
  }

  get callLogBadgeController() {
    if (!this._callLogBadgeController) {
      this._callLogBadgeController = new CallLogBadgeController(
        this._entitySourceController,
      );
    }

    return this._callLogBadgeController;
  }
}

export { CallLogController };
