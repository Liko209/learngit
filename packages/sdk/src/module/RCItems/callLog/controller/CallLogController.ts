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
import { CallLogHandleDataController } from './CallLogHandleDataController';
import { CallLogUserConfig } from '../config/CallLogUserConfig';
import { IEntityNotificationController } from 'sdk/framework/controller/interface/IEntityNotificationController';

class CallLogController {
  private _callLogActionController: CallLogActionController;
  private _allCallLogFetchController: AllCallLogFetchController;
  private _missedCallLogFetchController: MissedCallLogFetchController;
  private _callLogBadgeController: CallLogBadgeController;
  private _callLogHandleDataController: CallLogHandleDataController;
  constructor(
    private _entitySourceController: IEntitySourceController<CallLog, string>,
    private _userConfig: CallLogUserConfig,
    private _missedCallUserConfig: RCItemUserConfig,
    private _notificationController: IEntityNotificationController<CallLog>,
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

  get callLogHandleDataController() {
    if (!this._callLogHandleDataController) {
      this._callLogHandleDataController = new CallLogHandleDataController(
        this._userConfig,
        this._entitySourceController,
        this._notificationController,
      );
    }

    return this._callLogHandleDataController;
  }
}

export { CallLogController };
