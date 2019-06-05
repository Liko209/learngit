/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 14:31:49
 * Copyright © RingCentral. All rights reserved.
 */

import { SelectSettingItem } from '@/interface/setting';
import { BaseSettingItemProps, BaseSettingItemViewProps } from '../Base/types';

type SelectSettingItemProps = BaseSettingItemProps;

type SelectSettingItemViewProps<T> = BaseSettingItemViewProps & {
  settingItem: SelectSettingItem<T>;
  saveSetting(valueId: string): Promise<void> | void;
  extractValue: (value: T) => string;
};

export { SelectSettingItemProps, SelectSettingItemViewProps };
