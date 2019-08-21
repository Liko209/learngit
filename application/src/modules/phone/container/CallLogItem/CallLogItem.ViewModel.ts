/*
 * @Author: isaac.liu
 * @Date: 2019-06-03 14:44:12
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ENTITY_NAME } from '@/store';
import { getEntity, getSingleEntity } from '@/store/utils';
import CallLogModel from '@/store/models/CallLog';
import { CallLogItemProps, Handler } from './types';
import { CALL_RESULT } from 'sdk/module/RCItems/callLog/constants';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import { getHourMinuteSeconds } from '@/utils/date';
import { Profile } from 'sdk/module/profile/entity';
import ProfileModel from '@/store/models/Profile';
import { i18nP } from '@/utils/i18nT';
import { PhoneStore } from '../../store';
import { callLogDefaultResponsiveInfo, kHandlers } from './config';

class CallLogItemViewModel extends StoreViewModel<CallLogItemProps> {
  private _phoneStore: PhoneStore = container.get(PhoneStore);

  @computed
  get canEditBlockNumbers() {
    return this._phoneStore.canEditBlockNumbers;
  }

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
    return this.isMissedCall && this.data.timestamp > this.lastReadMissed;
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
  get isPseudo() {
    return this.data.isPseudo;
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
      return i18nP('telephony.result.missedcall');
    }
    const { direction } = this.data;
    return direction === CALL_DIRECTION.INBOUND
      ? i18nP('telephony.direction.inboundcall')
      : i18nP('telephony.direction.outboundcall');
  }

  @computed
  get duration() {
    const { duration } = this.data;
    const { secondTime, hourTime, minuteTime } = getHourMinuteSeconds(duration);
    const normalize = (s: number, suffix: string) =>
      s > 0 ? `${s} ${suffix}` : '';
    const array = [
      normalize(hourTime, i18nP('common.time.hour')),
      normalize(minuteTime, i18nP('common.time.min')),
      normalize(secondTime, i18nP('common.time.sec')),
    ];
    return array.join(' ');
  }

  @computed
  get startTime() {
    return this.data.startTime;
  }

  private _getResponsiveMap(handler: Handler[]) {
    const windowWidth = this.props.width;
    for (let i = 0; i < handler.length; i++) {
      const { checker, info } = handler[i];
      if (checker(windowWidth)) {
        return info;
      }
    }
    return callLogDefaultResponsiveInfo;
  }

  @computed
  get callLogResponsiveMap() {
    return this._getResponsiveMap(kHandlers);
  }
}

export { CallLogItemViewModel };
