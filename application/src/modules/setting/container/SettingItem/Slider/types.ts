/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 14:31:49
 * Copyright © RingCentral. All rights reserved.
 */

import { SliderSettingItem } from '@/interface/setting';
import { BaseSettingItemProps, BaseSettingItemViewProps } from '../Base/types';

type SliderSettingItemProps = BaseSettingItemProps;

type SliderSettingItemViewProps = BaseSettingItemViewProps & {
  settingItem: SliderSettingItem;
  saveSetting(value: number): Promise<void> | void;
};

export { SliderSettingItemProps, SliderSettingItemViewProps };
