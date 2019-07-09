/*
 * @Author: Lewi.Li
 * @Date: 2019-05-06 14:56:08
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, reaction } from 'mobx';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';
import Base from './Base';
import { PhoneNumberService } from 'sdk/module/phoneNumber';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { dialingCountryHandler } from '../handler/DialingCountryHandler';

export default class PhoneNumberModel extends Base<PhoneNumber, string> {
  @observable
  formattedPhoneNumber = this.id;

  constructor(data: PhoneNumber) {
    super(data);
    setTimeout(() => {
      reaction(
        () => dialingCountryHandler.regionInfo,
        async () => {
          const phoneNumberService = ServiceLoader.getInstance<PhoneNumberService>(ServiceConfig.PHONE_NUMBER_SERVICE);
          this.formattedPhoneNumber = await phoneNumberService.getLocalCanonical(
            this.id,
          );
        },
        { fireImmediately: true },
      );
    }, 0);
  }

  static fromJS(data: PhoneNumber) {
    return new PhoneNumberModel(data);
  }
}
