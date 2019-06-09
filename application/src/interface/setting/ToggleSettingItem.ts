/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-20 11:47:23
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingItem, SETTING_ITEM_TYPE } from './SettingItem';

type ToggleSettingItem = SettingItem & {
  type: SETTING_ITEM_TYPE.TOGGLE;
};

export { ToggleSettingItem };
