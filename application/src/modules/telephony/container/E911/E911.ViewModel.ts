/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:24:51
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, computed, action, IReactionPublic } from 'mobx';
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

import addressConfig from './address.json';
import {
  E911Props,
  E911ViewProps,
  Country,
  State,
  FieldsConfig,
  FieldItem,
} from './types';

const whitelist = ['US', 'Canada', 'Puerto Rico'];

const KEY_MAP = {
  street: 'street',
  additionalAddress: 'street2',
  city: 'city',
  state: 'state',
  zipCode: 'zip',
};

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

  @observable fields: FieldsConfig = {
    customerName: '',
  };

  constructor(props: E911Props) {
    super(props);
    this.reaction(
      () => this.settingItemEntity.value,
      (value: E911SettingInfo, reaction: IReactionPublic) => {
        if (value) {
          const cloneValue = { ...value };
          this.value = cloneValue;
          this.getCountryInfo();
          reaction.dispose();
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
    const fields = this.fields;
    const checkKeys = ['customerName', 'country'];

    Object.keys(fields).forEach((key: keyof FieldsConfig) => {
      if (key === 'customerName') {
        return;
      }
      if (!(fields[key] as FieldItem).optional) {
        checkKeys.push(KEY_MAP[key]);
      }
    });

    return checkKeys.some((field: string) => !this.value[field]);
  }

  @action
  async getState(country: Country) {
    const value = this.settingItemEntity.value!;
    if (!this.shouldShowSelectState) {
      this.value.state = country.id === value.countryId ? value.state : '';
      return;
    }

    const stateList = await this.rcInfoService.getStateList(country.id);

    this.stateList = stateList;
    if (stateList.length > 0) {
      const current = stateList.find(
        (item: State) => item.id === value.stateId,
      );
      this.saveStateOrCountry('state', current ? current : stateList[0]);
    }
  }

  @action
  async getCountryInfo() {
    let currentCountry;
    const countryList = await this.rcInfoService.getCountryList();
    const { countryName } = this.value;

    this.countryList = countryList;

    // if enter setting page directly
    // countryName has exist in setting model
    if (countryName) {
      currentCountry = this.countryList.find(
        (item: Country) => item.name === countryName,
      );
    } else {
      currentCountry = await this.rcInfoService.getCurrentCountry();
    }

    if (currentCountry) {
      this.getFields(currentCountry);
      this.saveStateOrCountry('country', currentCountry);
      this.getState(currentCountry);
    }
  }

  @computed
  get shouldShowSelectState() {
    const { country, countryName } = this.value;
    return whitelist.includes(country) || whitelist.includes(countryName);
  }

  @action
  getFields(country: Country) {
    const { name, isoCode } = country;
    this.fields =
      addressConfig[isoCode] || addressConfig[name] || addressConfig['default'];
  }

  countryOnChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const country = this.countryList.find(
      (item: Country) => item.name === value,
    );

    this.getFields(country!);
    this.saveStateOrCountry('country', country!);
    this.getState(country!);
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
    // if state type is text field only send state field to backend
    if (!this.shouldShowSelectState) {
      this.value.stateName = '';
      this.value.stateIsoCode = '';
      this.value.stateId = '';
    }

    await (this.settingItemEntity.valueSetter &&
      this.settingItemEntity.valueSetter(this.value));
  };
}

export { E911ViewModel };
