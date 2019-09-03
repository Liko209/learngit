/*
 * @Author: Lewi.Li
 * @Date: 2019-05-11 10:19:23
 * Copyright © RingCentral. All rights reserved.
 */
import { PhoneParserUtility } from 'sdk/utils/phoneParser';
import notificationCenter, {
  NotificationEntityPayload,
} from 'sdk/service/notificationCenter';
import { Person } from 'sdk/module/person/entity';
import { EVENT_TYPES, ENTITY } from 'sdk/service';
import { PhoneNumber } from '../entity';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PersonService } from 'sdk/module/person';

class PhoneNumberController {
  async getE164PhoneNumber(phoneNumber: string) {
    const phoneParserUtility = await PhoneParserUtility.getPhoneParser(
      phoneNumber,
      false,
    );
    const e164PhoneNumber = phoneParserUtility
      ? phoneParserUtility.getE164()
      : phoneNumber;
    return e164PhoneNumber;
  }

  async getLocalCanonical(phoneNumber: string) {
    const phoneParserUtility = await PhoneParserUtility.getPhoneParser(
      phoneNumber,
      false,
    );

    return phoneParserUtility
      ? phoneParserUtility.getLocalCanonical()
      : phoneNumber;
  }

  async isSpecialNumber(phoneNumber: string) {
    const phoneParserUtility = await PhoneParserUtility.getPhoneParser(
      phoneNumber,
      false,
    );

    return phoneParserUtility ? phoneParserUtility.isSpecialNumber() : false;
  }

  async isShortNumber(phoneNumber: string) {
    const phoneParserUtility = await PhoneParserUtility.getPhoneParser(
      phoneNumber,
      false,
    );

    return phoneParserUtility ? phoneParserUtility.isShortNumber() : false;
  }

  isValidNumber(toNumber: string) {
    return new RegExp('^[0-9+*# ()-.]+$').test(toNumber.trim());
  }

  async generateMatchedPhoneNumberList(
    phoneNumber: string,
    phoneParserUtility: PhoneParserUtility,
  ) {
    const numberList: string[] = [];
    numberList.push(phoneNumber);
    if (!phoneParserUtility) {
      return null;
    }

    if (phoneParserUtility.isShortNumber()) {
      const e164Num = phoneParserUtility.getE164();
      if (e164Num.length && e164Num !== phoneNumber) {
        numberList.push(e164Num);
      }
    } else if (
      !phoneParserUtility.isShortNumber() &&
      !phoneParserUtility.isSpecialNumber()
    ) {
      const e164Num = phoneParserUtility.getE164();
      if (e164Num.length && e164Num !== phoneNumber) {
        numberList.push(e164Num);
      }

      const countryCode = phoneParserUtility.getCountryCode();
      if (countryCode.length) {
        const pos = e164Num.indexOf(countryCode);
        if (pos === -1) {
          return;
        }
        const plusPos = phoneNumber.indexOf('+');
        if (plusPos === 0) {
          numberList.push(phoneNumber.substr(1));
        }
        const localCountryCode = await PhoneParserUtility.getStationCountryCode();
        const localAreaCode = await PhoneParserUtility.getStationAreaCode();
        if (localCountryCode && localCountryCode === countryCode) {
          const phoneWithoutCountryCode = e164Num.substr(
            pos + countryCode.length,
          );
          if (
            phoneWithoutCountryCode.length &&
            phoneWithoutCountryCode !== e164Num
          ) {
            numberList.push(phoneWithoutCountryCode);
            const areaCode = phoneParserUtility.getAreaCode();
            if (areaCode.length) {
              if (localAreaCode === areaCode) {
                numberList.push(phoneParserUtility.getNumber());
              }
              numberList.push(`0${phoneWithoutCountryCode}`);
            }
          }
        }
      }
    }
    return numberList;
  }

  handlePersonPayload = (payload: NotificationEntityPayload<Person>) => {
    if (payload.type === EVENT_TYPES.UPDATE) {
      const phoneNumbers: PhoneNumber[] = [];
      const personService = ServiceLoader.getInstance<PersonService>(
        ServiceConfig.PERSON_SERVICE,
      );
      payload.body.entities.forEach((person: Person) => {
        personService.getPhoneNumbers(person, (data: PhoneNumber) => {
          phoneNumbers.push(data);
        });
      });
      notificationCenter.emitEntityUpdate<PhoneNumber, string>(
        ENTITY.PHONE_NUMBER,
        phoneNumbers,
      );
    }
  };
}

export { PhoneNumberController };
