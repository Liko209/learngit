/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 14:25:33
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingItem } from '@/interface/setting';
import SettingModel from '@/store/models/UserSetting';

type BaseSettingItemProps = {
  id: SettingItem['id'];
  automationKey?: string;
};

type BaseSettingItemViewProps = {
  settingItem: SettingItem;
  settingItemEntity: SettingModel;
};

export { BaseSettingItemProps, BaseSettingItemViewProps };
