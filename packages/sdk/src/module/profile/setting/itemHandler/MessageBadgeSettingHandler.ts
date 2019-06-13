/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-05-29 14:18:44
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import {
  UserSettingEntity,
  AbstractSettingEntityHandler,
  SettingEntityIds,
} from 'sdk/module/setting';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { NotificationEntityUpdatePayload } from 'sdk/service/notificationCenter';

import { AccountService } from 'sdk/module/account';
import { ENTITY } from 'sdk/service';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import {
  NEW_MESSAGE_BADGES_OPTIONS,
  SETTING_KEYS,
} from 'sdk/module/profile/constants';
import { IProfileService } from '../../service/IProfileService';
import { Profile } from '../../entity';

export class MessageBadgeSettingHandler extends AbstractSettingEntityHandler<
  NEW_MESSAGE_BADGES_OPTIONS
> {
  id = SettingEntityIds.Notification_NewMessageBadgeCount;

  constructor(private _profileService: IProfileService) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.onEntity().onUpdate<Profile>(ENTITY.PROFILE, payload =>
      this.onProfileEntityUpdate(payload),
    );
  }

  async updateValue(value: NEW_MESSAGE_BADGES_OPTIONS) {
    await this._profileService.updateSettingOptions([
      { value, key: SETTING_KEYS.NEW_MESSAGE_BADGES },
    ]);
  }

  async fetchUserSettingEntity() {
    const profile = await this._profileService.getProfile();
    const settingItem: UserSettingEntity<NEW_MESSAGE_BADGES_OPTIONS> = {
      weight: 1,
      parentModelId: 1,
      valueType: 1,
      id: SettingEntityIds.Notification_NewMessageBadgeCount,
      source: [
        NEW_MESSAGE_BADGES_OPTIONS.GROUPS_AND_MENTIONS,
        NEW_MESSAGE_BADGES_OPTIONS.ALL,
      ],
      value: profile[SETTING_KEYS.NEW_MESSAGE_BADGES],
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
    if (
      profile[SETTING_KEYS.NEW_MESSAGE_BADGES] !==
      this.userSettingEntityCache!.value
    ) {
      await this.getUserSettingEntity();
    }
  }
}
