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

import { OutOfCountryDisclaimer } from './config';
import { E911Props, E911ViewProps, Country, State, CheckBox } from './types';

class E911ViewModel extends StoreViewModel<E911Props> implements E911ViewProps {
  @observable countryList: Country[] = [];
  @observable stateList: State[] = [];

  @observable checkboxList: CheckBox[];

  @observable region: Country;

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
    this.getRegion(() => {
      this.getDisclaimers();
    });
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
    const { state, stateName } = this.value;
    if (this.stateList.length > 0) {
      if (state) {
        checkField.push('state');
      }
      if (stateName) {
        checkField.push('stateName');
      }
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
    this.getDisclaimers(country!.isoCode);
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

  @action
  async getRegion(cb?: Function) {
    this.region = await this.rcInfoService.getCurrentCountry();
    cb && cb();
  }

  @computed
  get isOutOfCountry() {
    return true;
  }

  getDisclaimers(iscCode?: string) {
    if (!this.region || !this.region.isoCode) {
      return;
    }

    const currentIscCode = iscCode ? iscCode : this.region.isoCode;
    const disclaimers = OutOfCountryDisclaimer[currentIscCode]
      ? OutOfCountryDisclaimer[currentIscCode]
      : OutOfCountryDisclaimer.default;
    this.createCheckbox(disclaimers);
  }

  createCheckbox(disclaimers: string[]) {
    this.checkboxList = disclaimers.map((text: string) => {
      const isDefaultI18 = text === 'telephony.e911.disclaimer.default';
      const base = {
        i18text: text,
        checked: false,
      };
      return isDefaultI18
        ? {
            ...base,
            params: this.region,
          }
        : base;
    });
  }
}

export { E911ViewModel };
