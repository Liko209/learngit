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
import { CallLog } from 'sdk/module/RCItems/callLog/entity';

class RecentCallItemViewModel extends StoreViewModel<Props>
  implements ViewProps {
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

  @action
  makeCall = (event: React.MouseEvent) => {
    const { handleClick } = this.props;
    event.stopPropagation();

    handleClick();
  }
}

export { RecentCallItemViewModel };
