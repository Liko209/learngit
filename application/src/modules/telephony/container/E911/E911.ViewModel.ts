/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:24:51
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
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
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { ERROR_CODES_RC, JError } from 'sdk/error';

import { OutOfCountryDisclaimer } from './config';
import addressConfig from './address.json';
import { TelephonyStore } from '../../store';

import {
  E911Props,
  E911ViewProps,
  Country,
  State,
  FieldsConfig,
  FieldItem,
  CheckBox,
} from './types';

const whitelist = ['US', 'Canada', 'Puerto Rico'];

const DEFAULT_FIELDS = {
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
}

class E911ViewModel extends StoreViewModel<E911Props> implements E911ViewProps {
  @observable countryList: Country[] = [];
  @observable stateList: State[] = [];

  @observable checkboxList: CheckBox[] = [];

  @observable region: Country;

  @observable value: E911SettingInfo = DEFAULT_FIELDS;

  // if not network we should give a default country show text field
  // or waiting fetch data
  @observable fields: FieldsConfig = addressConfig['default'];

  @observable loading: boolean = false;

  constructor(props: E911Props) {
    super(props);
    this.reaction(
      () => this.settingItemEntity.value,
      async (value: E911SettingInfo, reaction: IReactionPublic) => {
        if (value) {
          const cloneValue = { ...value };
          this.value = cloneValue;
          await this.getCountryList();
          this.getCountryInfo();
          this.getRegion();
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

  get _telephonyStore() {
    return container.get(TelephonyStore);
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
        checkKeys.push(key);
      }
    });

    return (
      checkKeys.some((field: string) => !this.value[field]) ||
      !this.checkboxList.every((checkbox: CheckBox) => checkbox.checked)
    );
  }

  @catchError.flash({
    network: 'telephony.e911.prompt.networkError',
    server: 'telephony.e911.prompt.backendError',
  })
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

  @catchError.flash({
    network: 'telephony.e911.prompt.networkError',
    server: 'telephony.e911.prompt.backendError',
  })
  @action
  async getCountryInfo() {
    let currentCountry;
    const { countryName } = this.value;
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

  @catchError.flash({
    network: 'telephony.e911.prompt.networkError',
    server: 'telephony.e911.prompt.backendError',
  })
  @action
  getCountryList = async () => {
    if (this.countryList.length > 0) {
      return;
    }
    const countryList = await this.rcInfoService.getAllCountryList();
    this.countryList = countryList;
    await this.getCountryInfo();
  };

  @computed
  get shouldShowSelectState() {
    const { country, countryName } = this.value;
    return whitelist.includes(country) || whitelist.includes(countryName);
  }

  @action
  getFields(country: Country) {
    const { name, isoCode } = country;
    this.fields =
      addressConfig[name] || addressConfig[isoCode] || addressConfig['default'];
  }

  countryOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userSetting = this.settingItemEntity.value!;
    const { countryName } = userSetting;
    const { value } = e.target;
    const country = this.countryList.find(
      (item: Country) => item.name === value,
    );

    if (countryName !== country!.name) {
      const { customerName, ...rest } = DEFAULT_FIELDS;
      this.value = { customerName: this.value.customerName, ...rest };
    } else {
      const cloneValue = { ...userSetting };
      this.value = cloneValue;
    }

    this.getFields(country!);
    this.saveStateOrCountry('country', country!);
    this.getState(country!);
    this.getDisclaimers(country!);
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
    network: 'telephony.e911.prompt.networkError',
    server: 'telephony.e911.prompt.backendError',
  })
  onSubmit = async () => {
    const { successCallback } = this.props;
    // if state type is text field only send state field to backend
    if (!this.shouldShowSelectState) {
      this.value.stateName = '';
      this.value.stateIsoCode = '';
      this.value.stateId = '';
    }

    this.value.outOfCountry = this.checkboxList.length > 0;
    this.loading = true;
    try {
      await (this.settingItemEntity.valueSetter &&
        this.settingItemEntity.valueSetter(this.value));
      this.loading = false;
      successCallback && successCallback();
      return true;
    } catch (e) {
      this.loading = false;
      // need use different tip message according to backend error
      this.handleSubmitError(e);
      return false;
    }
  };

  handleSubmitError(e: JError) {
    const ERROR_MAP = {
      [ERROR_CODES_RC.EME_201]: {
        code: 'EME-201',
        text: 'telephony.e911.prompt.errorCode201',
      },
      [ERROR_CODES_RC.EME_202]: {
        code: 'EME-202',
      },
      [ERROR_CODES_RC.EME_203]: {
        code: 'EME-203',
      },
      [ERROR_CODES_RC.EME_204]: {
        code: 'EME-204',
      },
      [ERROR_CODES_RC.EME_205]: {
        code: 'EME-205',
      },
    };
    if (ERROR_MAP[e.code] && ERROR_MAP[e.code].code) {
      Notification.flashToast({
        message: ERROR_MAP[e.code].text || 'telephony.e911.prompt.backendError',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
      });
      return false;
    }
    throw e;
  }
  @action
  async getRegion() {
    this.region = await this.rcInfoService.getCurrentCountry();
    this.getDisclaimers();
  }

  getDisclaimers(country?: Country) {
    if (!this.region || !this.region.name) {
      return;
    }

    const outOfCountry = this.isOutOfCountry(country);
    if (!outOfCountry) {
      this.checkboxList = [];
      return;
    }

    const countryName = this.region.name;
    const disclaimers = OutOfCountryDisclaimer[countryName]
      ? OutOfCountryDisclaimer[countryName]
      : OutOfCountryDisclaimer.default;

    this.createCheckbox(disclaimers);
  }

  isOutOfCountry(country?: Country) {
    const region = this.region;
    const originalValue = this.settingItemEntity.value!;
    if (country) {
      return country.id !== region.id;
    }
    return region.id !== originalValue.countryId;
  }

  @action
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

  @action
  setCheckBox = (index: number) => () => {
    const current = this.checkboxList[index];
    current.checked = !current.checked;
  };

  closeE911 = (status: boolean) => {
    this._telephonyStore.switchE911Status(status);
  };
}

export { E911ViewModel };
