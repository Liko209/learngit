/*
 * @Author: Paynter Chen
 * @Date: 2019-05-24 13:33:49
 * Copyright © RingCentral. All rights reserved.
 */
import {
  UserSettingEntity,
  AbstractSettingEntityHandler,
  SettingEntityIds,
  SettingService,
} from 'sdk/module/setting';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { PhoneNumberModel } from 'sdk/module/person/entity';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { NotificationEntityUpdatePayload } from 'sdk/service/notificationCenter';

import { ENTITY } from 'sdk/service';
import { CALLING_OPTIONS } from 'sdk/module/profile/constants';
import { RC_INFO_KEYS } from 'sdk/module/rcInfo/config/constants';

export class CallerIdSettingHandler extends AbstractSettingEntityHandler<
PhoneNumberModel
> {
  id = SettingEntityIds.Phone_CallerId;

  constructor() {
    super();
    this._subscribe();
  }
  rcInfoConfig() {
    return ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    ).DBConfig;
  }

  private _subscribe() {
    this.onEntity().onUpdate<UserSettingEntity>(ENTITY.USER_SETTING, payload => this.onSettingEntityUpdate(payload));

    this.rcInfoConfig().on(RC_INFO_KEYS.EXTENSION_CALLER_ID, () => {
      this.onRcInfoEntityUpdate();
    });
  }
  dispose() {
    super.dispose();
    this.rcInfoConfig().off(RC_INFO_KEYS.EXTENSION_CALLER_ID, () => {
      this.onRcInfoEntityUpdate();
    });
  }

  async updateValue(record: PhoneNumberModel) {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    await rcInfoService.setDefaultCallerId(record.id);
  }

  async fetchUserSettingEntity() {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const settingService = ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    );
    const model = await settingService.getById<CALLING_OPTIONS>(
      SettingEntityIds.Phone_DefaultApp,
    );
    const callingOptions = model && model.value;
    const callerList = await rcInfoService.getCallerIdList();
    const info = await rcInfoService.getDefaultCallerId();
    const settingItem: UserSettingEntity<PhoneNumberModel> = {
      weight: 0,
      valueType: 0,
      parentModelId: 0,
      id: SettingEntityIds.Phone_CallerId,
      source: callerList,
      value: info,
      state:
        callingOptions === CALLING_OPTIONS.RINGCENTRAL
          ? ESettingItemState.INVISIBLE
          : ESettingItemState.ENABLE,
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }

  async onRcInfoEntityUpdate() {
    await this.getUserSettingEntity();
  }
  async onSettingEntityUpdate(
    payload: NotificationEntityUpdatePayload<UserSettingEntity>,
  ) {
    if (payload.body.entities.has(SettingEntityIds.Phone_DefaultApp)) {
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
    }
  }
}
