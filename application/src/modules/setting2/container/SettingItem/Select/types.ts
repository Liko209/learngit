/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 14:31:49
 * Copyright © RingCentral. All rights reserved.
 */

import { SelectSettingItem } from '@/interface/setting';
import SettingModel from '@/store/models/UserSetting';
import { SettingItemProps } from '../types';

type SelectSettingItemProps = SettingItemProps;

type SelectSettingItemViewProps<T> = {
  settingItem: SelectSettingItem<T>;
  settingItemEntity: SettingModel;
  automationId: string;
};

export { SelectSettingItemProps, SelectSettingItemViewProps };
