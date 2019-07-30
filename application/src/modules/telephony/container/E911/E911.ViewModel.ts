/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:24:51
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed, action } from 'mobx';
import { ChangeEvent } from 'react';
import { StoreViewModel } from '@/store/ViewModel';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { UserSettingEntity } from 'sdk/module/setting';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import SettingModel from '@/store/models/UserSetting';
import { SettingEntityIds } from 'sdk/module/setting/moduleSetting/types';
import { E911SettingInfo } from 'sdk/module/rcInfo/setting/types';
import { catchError } from '@/common/catchError';

import { E911Props, E911ViewProps, Country, State } from './types';

class E911ViewModel extends StoreViewModel<E911Props> implements E911ViewProps {
  @observable countryList: Country[] = [];
  @observable stateList: State[] = [];

  @observable value: E911SettingInfo = {
    street: '',
    street2: '',
    city: '',
    state: '',
    stateId: '',
    stateIsoCode: '',
    stateName: '',
    country: '',
    countryId: '',
    countryIsoCode: '',
    countryName: '',
    zip: '',
    customerName: '',
    outOfCountry: false,
  };

  constructor(props: E911Props) {
    super(props);
    this.reaction(
      () => this.settingItemEntity.value,
      (value: E911SettingInfo, dispose: any) => {
        if (value) {
          const cloneValue = { ...value };
          this.value = cloneValue;
          this.getCountryInfo();
          dispose();
        }
      },
      {
        fireImmediately: true,
      },
    );
  }

  get rcInfoService() {
    return ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
  }

  @computed
  get settingItemEntity() {
    return getEntity<UserSettingEntity, SettingModel<E911SettingInfo>>(
      ENTITY_NAME.USER_SETTING,
      SettingEntityIds.Phone_E911,
    );
  }

  @computed
  get disabled() {
    const checkField = ['customerName', 'country', 'street', 'city', 'zip'];
    if (this.stateList.length > 0) {
      checkField.push('state');
    }

    return checkField.some((field: string) => !this.value[field]);
  }

  @action
  async getState(countryId: string) {
    const stateList = await this.rcInfoService.getStateList(countryId);
    this.stateList = stateList;
    if (stateList.length > 0) {
      this.saveStateOrCountry('state', stateList[0]);
    }
  }

  @action
  async getCountryInfo() {
    const countryList = await this.rcInfoService.getCountryList();
    this.countryList = countryList;
    const { countryName } = this.value;
    let currentCountry;
    if (countryName) {
      currentCountry = this.countryList.find(
        (item: Country) => item.name === countryName,
      );
    } else {
      currentCountry = await this.rcInfoService.getCurrentCountry();
    }
    if (currentCountry) {
      this.saveStateOrCountry('country', currentCountry);
      this.getState(currentCountry.id);
    }
  }

  countryOnChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const country = this.countryList.find(
      (item: Country) => item.name === value,
    );
    this.saveStateOrCountry('country', country!);
    this.getState(country!.id);
  };

  stateOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const state = this.stateList.find((item: State) => item.name === value);
    this.saveStateOrCountry('state', state!);
  };

  @action
  saveStateOrCountry(type: 'state' | 'country', data: State | Country) {
    const { id, name, isoCode } = data;
    this.value[type] = isoCode;
    this.value[`${type}Name`] = name;
    this.value[`${type}Id`] = id;
    this.value[`${type}IsoCode`] = isoCode;
  }

  @action
  handleFieldChange = (type: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    this.value[type] = value;
  };

  @catchError.flash({
    network: 'telephony.e911.prompt.backendError',
    server: 'telephony.e911.prompt.networkError',
  })
  onSubmit = async () => {
    await (this.settingItemEntity.valueSetter &&
      this.settingItemEntity.valueSetter(this.value));
  };
}

export { E911ViewModel };
