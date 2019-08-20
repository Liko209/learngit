/*
 * @Author: isaac.liu
 * @Date: 2019-05-29 13:57:07
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { getEntity, getSingleEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import { container } from 'framework/ioc';
import { AppStore } from '@/modules/app/store';
import { MISSED_CALL_BADGE_ID } from 'sdk/module/RCItems/callLog/constants';
import { VOICEMAIL_BADGE_ID } from 'sdk/module/RCItems/voicemail/constants';
import BadgeModel from '@/store/models/Badge';
import { CALLING_OPTIONS } from 'sdk/module/profile';
import { PhoneUMIProps, PhoneUMIViewProps, PhoneUMIType } from './types';

class PhoneUMIViewModel extends StoreViewModel implements PhoneUMIViewProps {
  private _appStore = container.get(AppStore);

  constructor(props: PhoneUMIProps) {
    super(props);

    if (props.type === PhoneUMIType.ALL) {
      this.autorun(() => this.updateAppUmi());
    }
  }

  updateAppUmi() {
    this._appStore.setUmi({ phone: this.unreadCount });
  }

  @computed
  get isDefaultPhoneApp() {
    return (
      getSingleEntity(ENTITY_NAME.PROFILE, 'callOption') ===
      CALLING_OPTIONS.GLIP
    );
  }

  @computed
  get missedCallUMI() {
    const badge: BadgeModel = getEntity(
      ENTITY_NAME.BADGE,
      MISSED_CALL_BADGE_ID,
    );
    return badge.unreadCount || 0;
  }

  @computed
  get voicemailUMI() {
    const badge: BadgeModel = getEntity(ENTITY_NAME.BADGE, VOICEMAIL_BADGE_ID);
    return badge.unreadCount || 0;
  }

  @computed
  get unreadCount() {
    return this.missedCallUMI + this.voicemailUMI;
  }
}

export { PhoneUMIViewModel };
