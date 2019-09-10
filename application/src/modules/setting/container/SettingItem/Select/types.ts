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
  saveSetting(newValue: string, rawValue?: T): Promise<void> | void;
  extractValue: (raw: T) => string;
  value: string;
  source: T[];
};

export { SelectSettingItemProps, SelectSettingItemViewProps };
