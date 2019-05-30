/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-28 16:45:30
 * Copyright © RingCentral. All rights reserved.
 */

import {
  UserSettingEntity,
  AbstractSettingEntityHandler,
  SettingEntityIds,
} from 'sdk/module/setting';
import { NotificationEntityUpdatePayload } from 'sdk/service/notificationCenter';
import { ENTITY } from 'sdk/service';
import {
  EMAIL_NOTIFICATION_OPTIONS,
  SETTING_KEYS,
} from 'sdk/module/profile/constants';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { IProfileService } from '../../service/IProfileService';
import { Profile } from '../../entity';
import { AccountService } from 'sdk/module/account';
class DirectMessagesSettingHandler extends AbstractSettingEntityHandler<
  EMAIL_NOTIFICATION_OPTIONS
> {
  id = SettingEntityIds.Notification_DirectMessages;

  constructor(private _profileService: IProfileService) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.onEntity().onUpdate<Profile>(ENTITY.PROFILE, payload =>
      this.onProfileEntityUpdate(payload),
    );
  }

  async updateValue(value: EMAIL_NOTIFICATION_OPTIONS) {
    await this._profileService.updateSettingOptions([
      { value, key: SETTING_KEYS.EMAIL_DM },
    ]);
  }
  async fetchUserSettingEntity() {
    const profile = await this._profileService.getProfile();
    const settingItem: UserSettingEntity<EMAIL_NOTIFICATION_OPTIONS> = {
      weight: 1,
      valueType: 1,
      parentModelId: 1,
      source: [
        EMAIL_NOTIFICATION_OPTIONS.EVERY_15_MESSAGE,
        EMAIL_NOTIFICATION_OPTIONS.EVERY_HOUR,
        EMAIL_NOTIFICATION_OPTIONS.OFF,
      ],
      value: profile[SETTING_KEYS.EMAIL_DM],
      id: SettingEntityIds.Notification_DirectMessages,
      state: ESettingItemState.ENABLE,
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }

  async onProfileEntityUpdate(
    payload: NotificationEntityUpdatePayload<Profile>,
  ) {
    const accountConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const glipProfileId = accountConfig.getCurrentUserProfileId();
    const profile = payload.body.entities.get(glipProfileId);
    if (!profile) {
      return;
    }
    if (profile[SETTING_KEYS.EMAIL_DM] !== this.userSettingEntityCache.value) {
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
    }
  }
}
export { DirectMessagesSettingHandler };
