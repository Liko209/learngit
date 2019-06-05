/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-20 11:47:23
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { SettingItem, SETTING_ITEM_TYPE } from './SettingItem';

type SelectSettingItem<T> = SettingItem & {
  type: SETTING_ITEM_TYPE.SELECT;

  /**
   * Decide how the select renders value
   */
  valueRenderer?: ComponentType<{ value: T }>;

  /**
   * Decide how the select renders source
   */
  sourceRenderer?: ComponentType<{ value: T; source: T[] }>;

  /**
   * Default source when source not given by sdk
   */
  defaultSource?: T[];

  /**
   * Used for figure out which property in
   * the sourceItem is the key value
   */
  valueExtractor?: (value?: T) => string | undefined;
};

export { SelectSettingItem };
