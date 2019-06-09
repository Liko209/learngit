/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-29 18:21:47
 * Copyright © RingCentral. All rights reserved.
 */
import { UserSettingEntity } from 'sdk/module/setting';
import { ESettingItemState } from 'sdk/framework/model/setting/types';
import { getEntity } from '@/store/utils';
import SettingModel from '@/store/models/UserSetting';
import { ENTITY_NAME } from '@/store/constants';
import { SettingItem } from '@/interface/setting/SettingItem';

function getSettingItemEntity(id: number) {
  return getEntity<UserSettingEntity, SettingModel>(
    ENTITY_NAME.USER_SETTING,
    id,
  );
}

function isItemVisible(id: SettingItem['id']) {
  return getSettingItemEntity(id).state !== ESettingItemState.INVISIBLE;
}

export { getSettingItemEntity, isItemVisible };
