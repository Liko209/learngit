/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-27 14:16:31
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import CallLogModel from '@/store/models/CallLog';
import { CALL_RESULT } from 'sdk/module/RCItems/callLog/constants';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import { dialerTimestamp } from '@/utils/date';
import { container } from 'framework';
import { TelephonyService } from '../../service';
import { TelephonyStore } from '../../store';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import PhoneNumberModel from '@/store/models/PhoneNumber';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';
import { CallLog } from 'sdk/module/RCItems/callLog/entity';
import { analyticsCollector } from '@/AnalyticsCollector';

const ANALYTICS_SOURCE = 'dialer_callHistory';

class RecentCallItemViewModel extends StoreViewModel<Props>
  implements ViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  @computed
  get data() {
    return getEntity<CallLog, CallLogModel, string>(
      ENTITY_NAME.CALL_LOG,
      this.props.id,
    ) as CallLogModel;
  }

  @computed
  get icon() {
    if (this.isMissedCall) {
      return 'missedcall';
    }
    const { direction } = this.data;
    return direction === CALL_DIRECTION.INBOUND ? 'incall' : 'outcall';
  }

  @computed
  get isMissedCall() {
    const { result } = this.data;
    return result === CALL_RESULT.MISSED || result === CALL_RESULT.VOICEMAIL;
  }

  @computed
  get direction() {
    return this.data.direction;
  }

  @computed
  get startTime() {
    return dialerTimestamp(this.data.startTime);
  }

  @computed
  get caller() {
    const { direction } = this.data;
    return direction === CALL_DIRECTION.INBOUND ? this.data.from : this.data.to;
  }

  @computed
  get isBlock() {
    const caller = this.caller;
    if (!caller) {
      return true;
    }

    const { phoneNumber, extensionNumber } = caller;
    return !phoneNumber && !extensionNumber;
  }

  @computed
  get _phoneNumberModel() {
    const caller = this.caller;
    if (!caller || this.isBlock) {
      return;
    }

    const matchNumber = caller.extensionNumber || caller.phoneNumber;
    if (!matchNumber) {
      return;
    }

    return getEntity<PhoneNumber, PhoneNumberModel, string>(
      ENTITY_NAME.PHONE_NUMBER,
      matchNumber,
    );
  }

  @computed
  get phoneNumber() {
    return this._phoneNumberModel
      ? this._phoneNumberModel.formattedPhoneNumber
      : null;
  }

  @action
  handleClick = async () => {
    if (!this.phoneNumber) {
      return;
    }
    analyticsCollector.makeOutboundCall(ANALYTICS_SOURCE);
    if (!(await this._telephonyService.makeCall(this.phoneNumber))) {
      await new Promise(resolve => {
        requestAnimationFrame(resolve);
      });
      this._telephonyStore.end();
    }
  };
}

export { RecentCallItemViewModel };
