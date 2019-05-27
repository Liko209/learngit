/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 13:38:52
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { SETTING_ITEM_TYPE, SettingItem } from '@/interface/setting';
import { LinkSettingItem } from '../SettingItem/Link';
import { ToggleSettingItem } from '../SettingItem/Toggle';
import { SelectSettingItem } from '../SettingItem/Select';
import { observer } from 'mobx-react';

const ITEM_TYPE_MAP = {
  [SETTING_ITEM_TYPE.TOGGLE]: ToggleSettingItem,
  [SETTING_ITEM_TYPE.SELECT]: SelectSettingItem,
  [SETTING_ITEM_TYPE.LINK]: LinkSettingItem,
};

type SettingItemProxyProps = {
  id: SettingItem['id'];
  type: SettingItem['type'];
};

const SettingItemProxy = observer(({ id, type }: SettingItemProxyProps) => {
  const Comp =
    typeof type === 'number' || typeof type === 'string'
      ? ITEM_TYPE_MAP[type]
      : type;

  return <Comp id={id} />;
});

export { SettingItemProxy, SettingItemProxyProps };
