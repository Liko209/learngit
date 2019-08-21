/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-01 10:21:36
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import { ENTITY_NAME } from '@/store';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { PersonService } from 'sdk/module/person';
import { when } from 'mobx';
import { getEntity } from '@/store/utils';
import { READ_STATUS } from 'sdk/module/RCItems/constants';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import { PHONE_NUMBER_TYPE } from 'sdk/module/person/entity';
import { ContactInfoViewModel } from '../ContactInfo.ViewModel';

jest.mock('i18next', () => ({
  languages: ['en'],
  services: {
    backendConnector: {
      state: {
        'en|translation': -1,
      },
    },
  },
  isInitialized: true,
  t: (text: string) => text,
}));

describe('ContactInfoViewModel', () => {
  const mockPhoneAndPerson = ({ phone, person }: any) => (name: any) => {
    if (name === ENTITY_NAME.PHONE_NUMBER) {
      return phone;
    }
    if (name === ENTITY_NAME.PERSON) {
      return person;
    }
    return null;
  };

  @testable
  class _phoneNumberModel {
    @mockService(PersonService, 'matchContactByPhoneNumber')
    beforeEach() {}

    @test('should be return undefined if caller is undefined')
    t1() {
      const vm = new ContactInfoViewModel({
        readStatus: READ_STATUS.READ,
      });
      expect(vm._phoneNumberModel).toBeUndefined();
    }

    @test('should be return phone if has extensionNumber')
    @mockEntity(mockPhoneAndPerson({ phone: {} }))
    t2() {
      const caller = {
        name: 'name',
        extensionNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm._phoneNumberModel).toEqual({});
    }

    @test('should be return phone if isBlock = false and has phoneNumber')
    t3() {
      const caller = {
        name: 'name',
        phoneNumber: '101',
        location: 'location',
      };
      new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(getEntity).toHaveBeenCalledWith(ENTITY_NAME.PHONE_NUMBER, '101');
    }
  }

  @testable
  class phoneNumber {
    @mockService(PersonService, 'matchContactByPhoneNumber')
    beforeEach() {}

    @test('should be return formattedPhoneNumber if get _phoneNumberModel')
    @mockEntity(
      mockPhoneAndPerson({
        phone: {
          formattedPhoneNumber: '123456',
        },
      }),
    )
    t1() {
      const caller = {
        name: 'name',
        phoneNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm.phoneNumber).toBe('123456');
    }

    @test('should be return null if not _phoneNumberModel')
    t2() {
      const caller = {
        name: 'name',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm.phoneNumber).toBeNull();
    }
  }

  @testable
  class isExt {
    @test('should be return true if is extension number')
    @mockEntity(
      mockPhoneAndPerson({
        person: {
          userDisplayName: 'displayName',
          phoneNumbers: [
            {
              type: PHONE_NUMBER_TYPE.EXTENSION_NUMBER,
              phoneNumber: '123456',
            },
          ],
        },
        phone: {
          formattedPhoneNumber: '123456',
        },
      }),
    )
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    async t1(done: jest.DoneCallback) {
      const caller = {
        name: 'name',
        phoneNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm.person).toBeNull();
      await when(
        () => !!vm.personId,
        () => {
          expect(vm.isExt).toEqual(true);
          done();
        },
      );
    }

    @test('should be return false if person is null')
    @mockEntity(
      mockPhoneAndPerson({
        person: null,
        phone: {
          formattedPhoneNumber: '123456',
        },
      }),
    )
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    async t2(done: jest.DoneCallback) {
      const caller = {
        name: 'name',
        phoneNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm.person).toBeNull();
      await when(
        () => !!vm.personId,
        () => {
          expect(vm.person).toBeNull();
          expect(vm.isExt).toEqual(false);
          done();
        },
      );
    }

    @test('should be return false if phone number is null')
    @mockEntity(
      mockPhoneAndPerson({
        person: {
          userDisplayName: 'displayName',
          phoneNumbers: [
            {
              type: PHONE_NUMBER_TYPE.EXTENSION_NUMBER,
              phoneNumber: '123456',
            },
          ],
        },
        phone: {
          formattedPhoneNumber: null,
        },
      }),
    )
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    async t3(done: jest.DoneCallback) {
      const caller = {
        name: 'name',
        phoneNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm.phoneNumber).toBeNull();
      await when(
        () => !!vm.personId,
        () => {
          expect(vm.phoneNumber).toBeNull();
          expect(vm.isExt).toEqual(false);
          done();
        },
      );
    }
  }

  @testable
  class displayNumber {
    @test('should be format like Ext. XXX if is extension number')
    @mockEntity(
      mockPhoneAndPerson({
        person: {
          userDisplayName: 'displayName',
          phoneNumbers: [
            {
              type: PHONE_NUMBER_TYPE.EXTENSION_NUMBER,
              phoneNumber: '101',
            },
          ],
        },
        phone: {
          formattedPhoneNumber: '101',
        },
      }),
    )
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    async t1(done: jest.DoneCallback) {
      const caller = {
        name: 'name',
        phoneNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm.person).toBeNull();
      await when(
        () => !!vm.personId,
        () => {
          expect(vm.isExt).toEqual(true);
          expect(vm.displayNumber).toEqual('telephony.Ext 101');
          done();
        },
      );
    }

    @test('should be return phone number if is not extension number')
    @mockEntity(
      mockPhoneAndPerson({
        person: null,
        phone: {
          formattedPhoneNumber: '123456',
        },
      }),
    )
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    async t2(done: jest.DoneCallback) {
      const caller = {
        name: 'name',
        phoneNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm.person).toBeNull();
      await when(
        () => !!vm.personId,
        () => {
          expect(vm.isExt).toEqual(false);
          expect(vm.phoneNumber).toEqual('123456');
          done();
        },
      );
    }
  }

  @testable
  class person {
    @test('should be return person if personId change')
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    @mockEntity({ companyId: 2 })
    async t1(done: jest.DoneCallback) {
      const caller = {
        name: 'name',
        phoneNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm.person).toBeNull();
      await when(
        () => !!vm.personId,
        () => {
          expect(vm.person).toEqual({ companyId: 2 });
          expect(getEntity).toHaveBeenCalledWith(ENTITY_NAME.PERSON, 1);
          done();
        },
      );
    }
  }

  @testable
  class isUnread {
    @test('should be return false if message is read')
    t1() {
      const vm = new ContactInfoViewModel({
        readStatus: READ_STATUS.READ,
      });
      expect(vm.isUnread).toBeFalsy();
    }
    @test('should be return true if message is unread')
    t2() {
      const vm = new ContactInfoViewModel({
        readStatus: READ_STATUS.UNREAD,
      });
      expect(vm.isUnread).toBeTruthy();
    }
  }

  @testable
  class displayName {
    @test('should be return UNKNOWN_CALLER string if caller is undefined')
    t1() {
      const vm = new ContactInfoViewModel({
        readStatus: READ_STATUS.READ,
      });
      expect(vm.displayName).toBe('phone.unknownCaller');
    }

    @test('should be return displayName if has person')
    @mockEntity(
      mockPhoneAndPerson({
        person: {
          userDisplayName: 'displayName',
        },
      }),
    )
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    async t2(done: jest.DoneCallback) {
      const caller = {
        name: 'caller name',
        phoneNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm.displayName).toBe('caller name');
      await when(
        () => !!vm.person,
        () => {
          expect(vm.displayName).toBe('displayName');
          done();
        },
      );
    }

    @test('should be return caller name if has caller name')
    @mockEntity(null)
    @mockService(PersonService, 'matchContactByPhoneNumber', null)
    t3() {
      const caller = {
        name: 'name',
        phoneNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm.displayName).toBe('name');
    }

    @test('should be return unknown caller if is inbound call [JPT-2150]')
    @mockEntity(null)
    @mockService(PersonService, 'matchContactByPhoneNumber', null)
    t4() {
      const caller = {
        name: '',
        phoneNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
        direction: CALL_DIRECTION.INBOUND,
      });
      expect(vm.displayName).toBe('phone.unknownCaller');
    }

    @test('should be return unknown caller if is missed call [JPT-2150]')
    @mockEntity(null)
    @mockService(PersonService, 'matchContactByPhoneNumber', null)
    t5() {
      const caller = {
        name: '',
        phoneNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
        isMissedCall: true,
      });
      expect(vm.displayName).toBe('phone.unknownCaller');
    }
  }

  @testable
  class isBlock {
    // because of caller change will be reaction
    @mockService(PersonService, 'matchContactByPhoneNumber')
    @mockEntity(null)
    beforeEach() {}

    @test('should be return true if not caller')
    t1() {
      const vm = new ContactInfoViewModel({
        readStatus: READ_STATUS.READ,
      });
      expect(vm.isBlock).toBeTruthy();
    }

    @test('should be return false if has phoneNumber')
    t2() {
      const caller = {
        name: 'name',
        phoneNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm.isBlock).toBeFalsy();
    }

    @test('should be return false if has extensionNumber')
    t3() {
      const caller = {
        name: 'name',
        extensionNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(vm.isBlock).toBeFalsy();
    }
  }

  const personService = {
    name: ServiceConfig.PERSON_SERVICE,
    matchContactByPhoneNumber() {},
  };

  @testable
  class matchPerson {
    @test('should not call matchContactByPhoneNumber if not caller')
    @mockService(personService, 'matchContactByPhoneNumber')
    async t1() {
      new ContactInfoViewModel({
        readStatus: READ_STATUS.READ,
      });
      expect(personService.matchContactByPhoneNumber).not.toHaveBeenCalled();
    }

    @test(
      'should not call matchContactByPhoneNumber if not extensionNumber and phoneNumber',
    )
    @mockService(personService, 'matchContactByPhoneNumber')
    async t2() {
      const caller = {
        name: 'name',
        location: 'location',
      };
      new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      expect(personService.matchContactByPhoneNumber).not.toHaveBeenCalled();
    }

    @test('should call matchContactByPhoneNumber if has phoneNumber')
    @mockService(personService, 'matchContactByPhoneNumber', { id: 1 })
    @mockEntity(null)
    async t3(done: jest.DoneCallback) {
      const caller = {
        name: 'name',
        phoneNumber: '+123',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      await when(
        () => !!vm['_caller'],
        async () => {
          expect(
            await personService.matchContactByPhoneNumber,
          ).toHaveBeenCalledWith('+123');
          expect(vm.personId).toBe(1);
          done();
        },
      );
    }

    @test('should call matchContactByPhoneNumber if has extensionNumber')
    @mockService(personService, 'matchContactByPhoneNumber', null)
    @mockEntity(null)
    async t4(done: jest.DoneCallback) {
      const caller = {
        name: 'name',
        extensionNumber: '101',
        location: 'location',
      };
      const vm = new ContactInfoViewModel({
        caller,
        readStatus: READ_STATUS.READ,
      });
      await when(
        () => !!vm['_caller'],
        async () => {
          expect(
            await personService.matchContactByPhoneNumber,
          ).toHaveBeenCalledWith('101');
          expect(vm.personId).toBeUndefined();
          done();
        },
      );
    }
  }
});
