/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-29 18:21:47
 * Copyright © RingCentral. All rights reserved.
 */
import { UserSettingEntity } from 'sdk/module/setting';
import { getEntity } from '@/store/utils';
import SettingModel from '@/store/models/UserSetting';
import { ENTITY_NAME } from '@/store/constants';

function getSettingItemEntity(id: number) {
  return getEntity<UserSettingEntity, SettingModel>(
    ENTITY_NAME.USER_SETTING,
    id,
  );
}

export { getSettingItemEntity };
