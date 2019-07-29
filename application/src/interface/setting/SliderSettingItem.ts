/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-20 11:47:23
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingItem, SETTING_ITEM_TYPE } from './SettingItem';

type SliderSettingItem = SettingItem & {
  type: SETTING_ITEM_TYPE.SLIDER;

  /**
   * Decide how the Slider renders value
   */
  Left?: React.ReactNode;

  /**
   * Decide how the Slider renders source
   */
  Right?: React.ReactNode;

  /**
   * Minimum value
   */
  min: number;
  /**
   * Maximum value
   */
  max: number;

  /**
   * Step
   */
  step?: number;

  /**
   * Tooltip on thumb
   */
  valueLabelFormat?:
    | string
    | ((value: number, index: number) => React.ReactNode);
};

export { SliderSettingItem };
