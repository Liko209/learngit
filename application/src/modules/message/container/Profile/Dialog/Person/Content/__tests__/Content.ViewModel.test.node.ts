/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-06 16:57:29
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '@/store/utils';
import { ProfileDialogPersonContentViewModel } from '../Content.ViewModel';
import { ENTITY_NAME } from '@/store';
import { PHONE_NUMBER_TYPE } from 'sdk/module/person/entity';
import { formatPhoneNumber } from '@/modules/common/container/PhoneNumberFormat';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('@/store/utils');
jest.mock('sdk/module/phoneNumber/service/PhoneNumberService');
jest.mock('@/store/models/PhoneNumber');
jest.mock('@/modules/common/container/PhoneNumberFormat');

jest.mock('emoji-mart', () => ({
  getEmojiDataFromNative: () => ({
    colons: ':rainbow:',
  }),
}));
const url = 'URL';
const personService = {
  getHeadShotWithSize: () => url,
};
const mockCompanyData = {
  name: 'RingCentral',
};
const phoneNumber = '650-123-641';
const mockPersonData = {
  id: 1,
  companyId: 111,
  location: 'LOCATION',
  email: 'EMAIL',
  phoneNumbers: [
    { type: PHONE_NUMBER_TYPE.EXTENSION_NUMBER, phoneNumber: '214' },
    { type: PHONE_NUMBER_TYPE.DIRECT_NUMBER, phoneNumber: '123123' },
  ],
  homepage: 'www.ringcentral.com',
};

const mockMap = {
  [ENTITY_NAME.PERSON]: mockPersonData,
  [ENTITY_NAME.COMPANY]: mockCompanyData,
};

const props = {
  id: 123,
  dismiss: jest.fn(),
};
let vm: ProfileDialogPersonContentViewModel;

describe('MemberListItemViewModel', () => {
  beforeAll(() => {
    ServiceLoader.getInstance = jest.fn().mockReturnValue(personService);
    (getEntity as jest.Mock).mockImplementation((name, id) => {
      return mockMap[name];
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new ProfileDialogPersonContentViewModel(props);
  });

  describe('person', () => {
    it('should be get person entity when invoke class instance property person [JPT-441]', () => {
      expect(vm.person).toEqual(mockPersonData);
    });

    it('should be get the changed person entity when change person entity data [JPT-441]', () => {
      mockPersonData.location = 'LOCATION 2';
      mockPersonData.email = 'EMAIL 2';
      mockPersonData.homepage = 'www.ringcentral2.com';
      expect(vm.person).toEqual(mockPersonData);
    });
  });

  describe('company', () => {
    it('should be get company entity when invoke class instance property company [JPT-441]', () => {
      expect(vm.company).toEqual(mockCompanyData);
    });

    it('should be get the changed company entity when change company entity data [JPT-441]', () => {
      mockCompanyData.name = 'RingCentral 2';
      expect(vm.company).toEqual(mockCompanyData);
    });
  });

  describe('extensionNumbers', () => {
    it('should be get an array when invoke class instance property extensionNumbers [JPT-441]', () => {
      expect(vm.extensionNumbers).toEqual([mockPersonData.phoneNumbers[0]]);
    });
  });

  describe('directNumbers', () => {
    it('should be get an array when invoke class instance property directNumbers [JPT-441]', () => {
      expect(vm.directNumbers).toEqual([mockPersonData.phoneNumbers[1]]);
    });
    it('should return formatted phone number while call formatPhoneNumber', () => {
      (formatPhoneNumber as jest.Mock).mockImplementationOnce(() => {
        return phoneNumber;
      });
      expect(vm.directNumbers).toMatchObject([{ phoneNumber, type: 0 }]);
    });
  });
  describe('colonsEmoji', () => {
    it('should return emoji when get customStatus', () => {
      (getEntity as jest.Mock).mockReturnValue({
        awayStatus: ':rainbow: in the meeting',
      });
      expect(vm.colonsEmoji).toBe(':rainbow:');
    });
  });
  describe('url', () => {
    it('should return url when has url', () => {
      (getEntity as jest.Mock).mockReturnValue({
        hasHeadShot: true,
      });
      vm = new ProfileDialogPersonContentViewModel(props);
      expect(vm.url).toEqual(url);
    });
  });
});
