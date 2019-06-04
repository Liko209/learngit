/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 14:31:49
 * Copyright © RingCentral. All rights reserved.
 */

import { ToggleSettingItem } from '@/interface/setting';
import { BaseSettingItemProps, BaseSettingItemViewProps } from '../Base/types';

type ToggleSettingItemProps = BaseSettingItemProps;

type ToggleSettingItemViewProps = BaseSettingItemViewProps & {
  settingItem: ToggleSettingItem;
  saveSetting(value: boolean): Promise<void> | void;
};

export { ToggleSettingItemProps, ToggleSettingItemViewProps };
