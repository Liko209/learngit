/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:38:10
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';
import { BaseSettingItemViewModel } from '../Base/BaseSettingItem.ViewModel';
import { LinkSettingItemProps } from './types';

class LinkSettingItemViewModel extends BaseSettingItemViewModel<
  LinkSettingItemProps
> {
  @observable loading = false;
  private _valueCache = '';

  @action
  getUrl = () => {
    return (
      this._getUrlFromCache() ||
      this._getUrlFromValue() ||
      this._getUrlFromValueGetter()
    );
  }

  @action
  private _getUrlFromCache() {
    return this._valueCache;
  }

  @action
  private _getUrlFromValue() {
    return this.settingItemEntity.value;
  }

  @action
  private async _getUrlFromValueGetter() {
    const { valueGetter } = this.settingItemEntity;
    let result = '';
    if (valueGetter) {
      this.loading = true;
      result = await valueGetter();
      this._valueCache = result;
      this.loading = false;
    }
    return result;
  }
}

export { LinkSettingItemViewModel };
