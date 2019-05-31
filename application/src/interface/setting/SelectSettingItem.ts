/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-20 11:47:23
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingItem, SETTING_ITEM_TYPE } from './SettingItem';
import { ComponentType } from 'enzyme';

type SelectSettingItem<T> = SettingItem & {
  type: SETTING_ITEM_TYPE.SELECT;

  /**
   * Decide how the select renders value
   */
  valueRenderer?: ComponentType<{ value: T }>;

  /**
   * Decide how the select renders source
   */
  sourceRenderer?: ComponentType<{ value: T }>;

  /**
   * Used for figure out which property in
   * the sourceItem is the key value
   */
  valueExtractor?: (value?: T) => string | undefined;
};

export { SelectSettingItem };
