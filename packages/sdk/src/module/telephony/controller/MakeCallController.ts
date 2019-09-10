/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-02 17:02:29
 * Copyright © RingCentral. All rights reserved.
 */

import { MAKE_CALL_ERROR_CODE } from '../types';
import { IPersonService } from 'sdk/module/person/service/IPersonService';
import { IPhoneNumberService } from 'sdk/module/phoneNumber/service/IPhoneNumberService';
import { ContactType } from 'sdk/module/person';
import { IRCInfoService } from 'sdk/module/rcInfo/service/IRCInfoService';

/* eslint-disable */
class MakeCallController {
  constructor(
    private _personService: IPersonService,
    private _phoneNumberService: IPhoneNumberService,
    private _rcInfoService: IRCInfoService,
  ) { }

  private _checkInternetConnection() {
    if (!window.navigator.onLine) {
      return MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION;
    }
    return MAKE_CALL_ERROR_CODE.NO_ERROR;
  }

  private async _isExtension(phoneNumber: string) {
    const person = await this._personService.matchContactByPhoneNumber(
      phoneNumber,
      ContactType.GLIP_CONTACT,
    );
    return person !== null;
  }

  private _isSpecialNumber(phoneNumber: string) {
    return this._phoneNumberService.isSpecialNumber(phoneNumber);
  }

  async tryMakeCall(phoneNumber: string) {
    let result = MAKE_CALL_ERROR_CODE.NO_ERROR;
    let finalNumber = await this._phoneNumberService.getE164PhoneNumber(
      phoneNumber,
    );
    const dialingCountryInfo = await this._rcInfoService.getCurrentCountry();
    let countryId = dialingCountryInfo.id;
    do {
      result = this._checkInternetConnection();
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }

      // check if it is special number
      if (await this._isSpecialNumber(phoneNumber)) {
        // check if it's an ext
        if (await this._isExtension(phoneNumber)) {
          const countryInfo = await this._rcInfoService.getDefaultCountryInfo();
          if (countryInfo) {
            countryId = countryInfo.id;
          }
          finalNumber = phoneNumber;
          break;
        }

        // should have DL before making call to emergency number
        const lines = await this._rcInfoService.getDigitalLines();
        result = lines.length
          ? MAKE_CALL_ERROR_CODE.NO_ERROR
          : MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER;
        break;
      }
    } while (false);

    return { result, finalNumber, countryId };
  }
}

export { MakeCallController };
