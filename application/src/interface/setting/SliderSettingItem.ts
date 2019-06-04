/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-20 11:47:23
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { SettingItem, SETTING_ITEM_TYPE } from './SettingItem';

type SliderSettingItem = SettingItem & {
  type: SETTING_ITEM_TYPE.SLIDER;

  /**
   * Decide how the Slider renders value
   */
  Left?: ComponentType<any>;

  /**
   * Decide how the Slider renders source
   */
  Right?: ComponentType<any>;

  min: number;
  step?: number;
  max: number;
};

export { SliderSettingItem };
