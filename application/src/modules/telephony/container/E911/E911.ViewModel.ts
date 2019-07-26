/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:24:51
 * Copyright © RingCentral. All rights reserved.
 */
import { observable } from 'mobx';
import { ChangeEvent } from 'react';
import { StoreViewModel } from '@/store/ViewModel';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

import { E911Props, E911ViewProps, Country, State } from './types';

class E911ViewModel extends StoreViewModel<E911Props> implements E911ViewProps {
  @observable countryList: Country[] = [
    { callingCode: '1', id: '1', isoCode: 'US', name: 'United States' },
    { callingCode: '12', id: '2', isoCode: 'US2', name: 'United States2' },
  ];
  @observable stateList: State[] = [];

  @observable state: string = '';
  @observable country: string = '';
  @observable customerName: string = '';
  @observable street: string = '';
  @observable street2: string = ''; // additional address
  @observable city: string = '';
  @observable zipCode: string = '';

  get rcInfoService() {
    return ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
  }

  async getState(countryId: string) {
    const stateList = await this.rcInfoService.getStateList(countryId);
    this.stateList = stateList;
    this.state = stateList[0].name;
  }

  getCountryInfo = async () => {
    const countryList = await this.rcInfoService.getCountryList();
    const currentCountry = await this.rcInfoService.getCurrentCountry();
    this.country = currentCountry.name
      ? currentCountry.name
      : countryList[0].name;
    this.countryList = countryList;
    const countryId = currentCountry.id ? currentCountry.id : countryList[0].id;
    this.getState(countryId);
  };

  countryOnChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const select = this.countryList.find(
      (item: Country) => item.name === value,
    );
    this.country = value;
    this.getState(select!.id);
  };

  stateOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    this.state = value;
  };

  handleFieldChange = (type: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    this[type] = value;
  };

  onSubmit = () => {
    const data = {
      country: this.country,
      state: this.state,
      customerName: this.customerName,
      street: this.street,
      street2: this.street2,
      zipCode: this.zipCode,
      city: this.city,
    };
    console.log(data, '---nello 222');
  };
}

export { E911ViewModel };
