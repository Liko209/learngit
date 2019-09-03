/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-15 13:34:08
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { computed, action } from 'mobx';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { getEntity, getGlobalValue } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import ConferenceItemModel from '@/store/models/ConferenceItem';
import { Item } from 'sdk/module/item/entity';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { TelephonyService } from '@/modules/telephony/service';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';
import { analyticsCollector } from '@/AnalyticsCollector';
import { TelephonyStore } from '@/modules/telephony/store';
// TO-DO: This definition need to be moved to brand config once Brand is supported.
const GLOBAL_NUMBER_RC = 'https://ringcentr.al/2L14jqL';

class ConferenceViewModel extends StoreViewModel<Props> implements ViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  private _featuresFlagsService: FeaturesFlagsService = container.get(
    FeaturesFlagsService,
  );

  @computed
  private get _id() {
    return this.props.ids[0];
  }

  @computed
  get conference() {
    return getEntity<Item, ConferenceItemModel>(ENTITY_NAME.ITEM, this._id);
  }

  @computed
  get isHostByMe() {
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return !!(
      currentUserId &&
      this.conference.creatorId &&
      currentUserId === this.conference.creatorId
    );
  }
  @computed
  get phoneNumber() {
    return formatPhoneNumber(this.conference.phoneNumber);
  }

  @computed
  get globalNumber() {
    return GLOBAL_NUMBER_RC;
  }

  @computed
  get isRCUser() {
    return getGlobalValue(GLOBAL_KEYS.IS_RC_USER);
  }

  @computed
  get canUseConference() {
    return this._featuresFlagsService.canIUseConference && this.isRCUser;
  }

  @action
  joinAudioConference = (type?: string) => {
    const { hostCode, participantCode } = this.conference;
    const accessCode = this.isHostByMe ? hostCode : participantCode;
    this._telephonyService.joinAudioConference(this.phoneNumber, accessCode);

    analyticsCollector.joinConferenceCall(type);
  };

  // :TODO when multiple call will change
  @computed
  get disabled() {
    return !!this._telephonyStore.ids.length;
  }
}

export { ConferenceViewModel };
