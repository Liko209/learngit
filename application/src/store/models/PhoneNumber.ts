/*
 * @Author: Lewi.Li
 * @Date: 2019-05-06 14:56:08
 * Copyright © RingCentral. All rights reserved.
 */
import { reaction, observable, computed } from 'mobx';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';
import Base from './Base';
import { dialingCountryHandler } from '../handler/DialingCountryHandler';
import { PhoneNumberService } from 'sdk/module/phoneNumber';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

export default class PhoneNumberModel extends Base<PhoneNumber, string> {
  @observable
  private _formattedPhoneNumber = this.id;

  constructor(data: PhoneNumber) {
    super(data);
    reaction(
      () => dialingCountryHandler.regionInfo,
      async () => {
        // prettier-ignore
        const phoneNumberService = ServiceLoader.getInstance<PhoneNumberService>(ServiceConfig.PHONE_NUMBER_SERVICE);
        this._formattedPhoneNumber = await phoneNumberService.getLocalCanonical(
          this.id,
        );
      },
      { fireImmediately: true },
    );
  }

  @computed
  get formattedPhoneNumber() {
    return this._formattedPhoneNumber;
  }

  static fromJS(data: PhoneNumber) {
    return new PhoneNumberModel(data);
  }
}
