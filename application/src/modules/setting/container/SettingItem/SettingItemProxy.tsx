/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 13:38:52
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { container } from 'framework/ioc';
import { SETTING_ITEM_TYPE, SettingItem } from '@/interface/setting';
import { SettingStore } from '../../store/SettingStore';
import { LinkSettingItem } from './Link';
import { ToggleSettingItem } from './Toggle';
import { SelectSettingItem } from './Select';
import { SliderSettingItem } from './Slider';

const ITEM_TYPE_MAP = {
  [SETTING_ITEM_TYPE.TOGGLE]: ToggleSettingItem,
  [SETTING_ITEM_TYPE.SELECT]: SelectSettingItem,
  [SETTING_ITEM_TYPE.VIRTUALIZED_SELECT]: SelectSettingItem,
  [SETTING_ITEM_TYPE.LINK]: LinkSettingItem,
  [SETTING_ITEM_TYPE.SLIDER]: SliderSettingItem,
};

type SettingItemProxyProps = {
  itemId: SettingItem['id'];
};

@observer
class SettingItemProxy extends React.Component<SettingItemProxyProps> {
  private get _settingStore(): SettingStore {
    return container.get(SettingStore);
  }

  @computed
  private get _settingItem() {
    return this._settingStore.getItemById(this.props.itemId);
  }

  render() {
    if (!this._settingItem) return null;

    const { itemId } = this.props;
    const { type } = this._settingItem;
    const Comp =
      typeof type === 'number' || typeof type === 'string'
        ? ITEM_TYPE_MAP[type]
        : type;

    return <Comp id={itemId} />;
  }
}

export { SettingItemProxy, SettingItemProxyProps };
