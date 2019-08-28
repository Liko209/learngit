/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 14:55:18
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Props } from './types';
import { RecentCallLogsHandler } from './RecentCallLogsHandler';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { CallLog } from 'sdk/module/RCItems/callLog/entity';
import CallLogModel from '@/store/models/CallLog';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import PhoneNumberModel from '@/store/models/PhoneNumber';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';
import { container } from 'framework/ioc';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../../service';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { analyticsCollector } from '@/AnalyticsCollector';

const ANALYTICS_SOURCE = 'dialer_callHistory';

const InitIndex = 0;

class RecentCallsViewModel extends StoreViewModel<Props> {
  @observable focusIndex: number = InitIndex;
  @observable
  isError = false;
  @observable
  private _recentCallLogsHandler: RecentCallLogsHandler | undefined;
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  constructor() {
    super();
    const recentCallLogsHandler = new RecentCallLogsHandler();
    recentCallLogsHandler.init().then(() => {
      this._recentCallLogsHandler = recentCallLogsHandler;
    });
  }

  @action
  increaseFocusIndex = () => {
    const next = this.focusIndex + 1;
    const maxIndex = this.recentCallIds.length - 1;
    this.focusIndex = next >= maxIndex ? maxIndex : next;
  };

  @action
  decreaseFocusIndex = () => {
    const next = this.focusIndex - 1;
    const minimumIndex = 0;
    this.focusIndex = next <= minimumIndex ? minimumIndex : next;
  };

  @action
  makeCall = async (focusIndex?: number) => {
    if (!this.dialerInputFocused) {
      return;
    }
    if (typeof focusIndex === 'number') {
      this.focusIndex = focusIndex;
    }
    if (!this.phoneNumber) {
      return;
    }
    analyticsCollector.makeOutboundCall(ANALYTICS_SOURCE);
    return this._telephonyService.directCall(this.phoneNumber);
  };

  @computed
  get selectedCallItemIndex() {
    return this._telephonyStore.selectedCallItem.index;
  }

  @action
  selectCallItem = (focusIndex?: number) => {
    if (!this.dialerInputFocused) {
      return;
    }
    if (typeof focusIndex === 'number') {
      this.focusIndex = focusIndex;
    }

    // analyticsCollector.makeOutboundCall(ANALYTICS_SOURCE);
    if (this.selectedCallItemIndex === this.focusIndex) {
      this._telephonyStore.setCallItem('', NaN);
      return;
    }
    return this._telephonyStore.setCallItem(
      this.phoneNumber || '',
      this.focusIndex || 0,
    );
  };

  @computed
  private get _callLogId() {
    return (
      this.listHandler &&
      this.listHandler.sortableListStore.getIds[this.focusIndex]
    );
  }

  @computed
  get data() {
    if (this._callLogId) {
      return getEntity<CallLog, CallLogModel, string>(
        ENTITY_NAME.CALL_LOG,
        this._callLogId,
      ) as CallLogModel;
    }
    return null;
  }

  @computed
  get caller() {
    if (this.data) {
      const { direction } = this.data;
      return direction === CALL_DIRECTION.INBOUND
        ? this.data.from
        : this.data.to;
    }
    return null;
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

  @computed
  get listHandler() {
    return this._recentCallLogsHandler && this._recentCallLogsHandler.foc;
  }

  @computed
  get recentCallIds() {
    return this._recentCallLogsHandler
      ? this._recentCallLogsHandler.recentCallIds
      : [];
  }

  @computed
  get dialerInputFocused() {
    return this._telephonyStore.dialerInputFocused;
  }

  @action
  onErrorReload = () => {
    this.isError = false;
  };

  @computed
  get isTransferPage() {
    return this._telephonyStore.isTransferPage;
  }

  dispose = () => {
    this._recentCallLogsHandler && this._recentCallLogsHandler.dispose();
  };
}

export { RecentCallsViewModel };
