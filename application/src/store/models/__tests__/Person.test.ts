/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-14 14:43:42
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '../../../store/models/Person';
import {
  Person,
  PhoneNumberInfo,
  PHONE_NUMBER_TYPE,
} from 'sdk/module/person/entity';

import { PersonService } from 'sdk/module/person';

jest.mock('sdk/api');

type UserInfo = {
  firstName?: string;
  lastName?: string;
  email?: string;
};
function getUserInfo(firstName?, lastName?, email?) {
  return {
    firstName,
    lastName,
    email,
  };
}
function checkDisplayName(userInfo: UserInfo, matchName: string) {
  const { firstName = '', lastName = '', email = '' } = userInfo;
  const pm = PersonModel.fromJS({
    email,
    id: 12,
    first_name: firstName,
    last_name: lastName,
  } as Person);
  const display = pm.userDisplayName;
  expect(display).toBe(matchName);
}

function checkShortName(userInfo: UserInfo, matchName: string) {
  const { firstName = '', lastName = '', email = '' } = userInfo;
  const pm = PersonModel.fromJS({
    email,
    id: 12,
    first_name: firstName,
    last_name: lastName,
  } as Person);
  const display = pm.shortName;
  expect(display).toBe(matchName);
}

describe('PersonModel', () => {
  describe('displayName', () => {
    it('should return firstName + lastName if user has both', () => {
      checkDisplayName(getUserInfo('John', 'Doe'), 'John Doe');
    });

    it('should return firstName if user has only firstName', () => {
      checkDisplayName(getUserInfo('John'), 'John');
    });

    it('should return lastName if user has only lastName', () => {
      checkDisplayName(getUserInfo('', 'Doe'), 'Doe');
    });

    it('should return email if user has only firstName', () => {
      checkDisplayName(
        getUserInfo('', '', 'john.doe@ringcentral.com'),
        'John Doe',
      );
    });
  });

  describe('short name', () => {
    it('should return AH if firstName=alvin,lastName=huang', () => {
      checkShortName(getUserInfo('alvin', 'huang'), 'AH');
    });
    it('should return A if firstName=alvin,lastName=', () => {
      checkShortName(getUserInfo('alvin', ''), 'A');
    });
    it('should return ,A if firstName=,alvin,lastName=', () => {
      checkShortName(getUserInfo(',alvin', ''), ',');
    });
    it('should return 1H if firstName=1alvin,lastName=huang', () => {
      checkShortName(getUserInfo('1alvin', 'huang'), '1H');
    });
    it('should return H if firstName=,lastName=huang', () => {
      checkShortName(getUserInfo('', 'huang'), 'H');
    });
    it('should return A if firstName=,lastName=,email=alvin.huang@ringcentral.com', () => {
      checkShortName(getUserInfo('', '', 'alvin.huang@ringcentral.com'), 'A');
    });
  });
  describe('hasHeadShot', () => {
    const pm = PersonModel.fromJS({
      headshot_version: 1234,
      headshot: {
        url: 'headshot://xxx',
      },
    } as Person);
    it('should return non false value if headshot_version or headshot has value', () => {
      expect(!!pm.hasHeadShot).toBe(true);
    });
  });

  describe('phoneNumbers', () => {
    const personService = new PersonService();
    PersonService.getInstance = jest.fn().mockReturnValue(personService);

    it('should filter return only direct number and extension number', () => {
      const person: Person = {
        id: 1,
        company_id: 1,
        email: '1@1.com',
        me_group_id: 2,
        rc_phone_numbers: [
          { id: 11, phoneNumber: '1', usageType: 'MainCompanyNumber' },
          { id: 11, phoneNumber: '2', usageType: 'CompanyNumber' },
          { id: 11, phoneNumber: '3', usageType: 'AdditionalCompanyNumber' },
          { id: 11, phoneNumber: '4', usageType: 'ForwardedNumber' },
          { id: 11, phoneNumber: '5', usageType: 'MainCompanyNumber' },
          { id: 12, phoneNumber: '234567', usageType: 'DirectNumber' },
        ],
        sanitized_rc_extension: { extensionNumber: '4711', type: 'User' },
        created_at: 111,
        modified_at: 222,
        creator_id: 11,
        is_new: true,
        deactivated: false,
        version: 123,
      };

      const pm: PersonModel = new PersonModel(person);

      const expectRes: PhoneNumberInfo[] = [
        {
          type: PHONE_NUMBER_TYPE.EXTENSION_NUMBER,
          phoneNumber: '4711',
        },
        {
          type: PHONE_NUMBER_TYPE.DIRECT_NUMBER,
          phoneNumber: '234567',
        },
      ];

      personService.getAvailablePhoneNumbers = jest
        .fn()
        .mockReturnValue(expectRes);

      const res = pm.phoneNumbers;
      expect(res).toEqual(expectRes);
      expect(personService.getAvailablePhoneNumbers).toBeCalledWith(
        pm.companyId,
        pm.rcPhoneNumbers,
        pm.sanitizedRcExtension,
      );
    });
  });
});
