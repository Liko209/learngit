/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-27 14:16:31
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props } from './types';
import CallLogModel from '@/store/models/CallLog';
import { CALL_RESULT } from 'sdk/module/RCItems/callLog/constants';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import { dialerTimestamp } from '@/utils/date';
import { CallLog } from 'sdk/module/RCItems/callLog/entity';
import { container } from 'framework/ioc';
import { TelephonyStore } from '../../store';

class RecentCallItemViewModel extends StoreViewModel<Props> {
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
  get isTransferPage() {
    return this._telephonyStore.isTransferPage;
  }

  @computed
  get selectedCallItemIndex() {
    return this._telephonyStore.selectedCallItem.index;
  }

  @action
  handleClick = (event: React.MouseEvent) => {
    const { onClick } = this.props;
    event.stopPropagation();

    onClick();
  };
}

export { RecentCallItemViewModel };
