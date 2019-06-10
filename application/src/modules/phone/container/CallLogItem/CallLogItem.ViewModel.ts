/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 14:44:12
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { getEntity, getSingleEntity } from '@/store/utils';
import CallLogModel from '@/store/models/CallLog';
import { CallLogItemProps } from './types';
import { CALL_RESULT } from 'sdk/module/RCItems/callLog/constants';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import { getHourMinuteSeconds, postTimestamp } from '@/utils/date';
import { Profile } from 'sdk/module/profile/entity';
import ProfileModel from '@/store/models/Profile';

class CallLogItemViewModel extends StoreViewModel<CallLogItemProps> {
  @computed
  get data() {
    return getEntity(ENTITY_NAME.CALL_LOG, this.props.id) as CallLogModel;
  }

  @computed
  get lastReadMissed() {
    return (
      getSingleEntity<Profile, ProfileModel>(
        ENTITY_NAME.PROFILE,
        'lastReadMissed',
      ) || 0
    );
  }

  @computed
  get isUnread() {
    return this.data.id > this.lastReadMissed;
  }

  @computed
  get caller() {
    const { direction } = this.data;
    return direction === CALL_DIRECTION.INBOUND ? this.data.from : this.data.to;
  }

  @computed
  get direction() {
    return this.data.direction;
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
  get callType() {
    if (this.isMissedCall) {
      return 'telephony.result.missedcall';
    }
    const { direction } = this.data;
    return direction === CALL_DIRECTION.INBOUND
      ? 'telephony.direction.inboundcall'
      : 'telephony.direction.outboundcall';
  }

  @computed
  get duration() {
    const { duration } = this.data;
    const { secondTime, hourTime, minuteTime } = getHourMinuteSeconds(duration);
    const normalize = (s: number, suffix: string) =>
      s > 0 ? `${s}${suffix}` : '';
    const array = [
      normalize(hourTime, ' hour'),
      normalize(minuteTime, ' min'),
      normalize(secondTime, ' sec'),
    ];
    return array.join(' ');
  }

  @computed
  get startTime() {
    return postTimestamp(this.data.startTime);
  }
}

export { CallLogItemViewModel };
