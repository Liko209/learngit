/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-26 09:16:38
 * Copyright © RingCentral. All rights reserved.
 */

import { PHONE_NUMBER_TYPE } from 'sdk/module/person/entity';
import { RCInfoService } from 'sdk/module/rcInfo';
import React from 'react';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import { ENTITY_NAME } from '@/store';
import { mountWithTheme } from 'shield/utils';
import { testable, test } from 'shield';
import { Caller } from 'sdk/module/RCItems/types';
import { PersonService } from 'sdk/module/person';
import { Actions } from '../Actions';
import { ENTITY_TYPE } from '../../constants';
import { Block } from '../Block';

const mockPhoneAndPerson = ({ phone, person }: any) => (name: any) => {
  if (name === ENTITY_NAME.PHONE_NUMBER) {
    return phone;
  }
  if (name === ENTITY_NAME.PERSON) {
    return person;
  }
  return null;
};

const mockCaller = {
  phoneNumber: '+1234567890',
} as Caller

describe('Action', () => {
  @testable
  class init {
    @test(
      'should show block/unblock button when user has block/unblock permission and phone number is correct [JPT-2408-Step1/JPT-2409-Step1]'
    )
    @mockService(PersonService, 'matchContactByPhoneNumber')
    @mockService(RCInfoService, 'isNumberBlocked', false)
    @mockEntity(
      mockPhoneAndPerson({
        phone: {
          formattedPhoneNumber: '+1234567890',
        },
      }),
    )
    t1() {
      const wrapper = mountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={7}
          caller={mockCaller}
          hookAfterClick={() => { }}
          canEditBlockNumbers={true}
          entity={ENTITY_TYPE.CALL_LOG}
        />
      )
      wrapper.update();
      expect(wrapper.find(Block).exists()).toBeTruthy();
    }

    @test(
      'should hide block/unblock button when user does not have block/unblock permission [JPT-2414]'
    )
    @mockService(PersonService, 'matchContactByPhoneNumber')
    @mockEntity(
      mockPhoneAndPerson({
        phone: {
          formattedPhoneNumber: '+1234567890',
        },
      }),
    )
    t2() {
      const wrapper = mountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={7}
          caller={mockCaller}
          hookAfterClick={() => { }}
          canEditBlockNumbers={false}
          entity={ENTITY_TYPE.CALL_LOG}
        />
      )
      expect(wrapper.find(Block).exists()).toBeFalsy();
    }

    @test('should hide block/unblock button when number is Extension number [JPT-2415]')
    @mockEntity(
      mockPhoneAndPerson({
        person: {
          userDisplayName: 'displayName',
          phoneNumbers: [
            {
              type: PHONE_NUMBER_TYPE.EXTENSION_NUMBER,
              phoneNumber: '+1234567890',
            },
          ],
        },
        phone: {
          formattedPhoneNumber: '+1234567890',
        },
      }),
    )
    @mockService(RCInfoService, 'isNumberBlocked', false)
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    async t3(done: jest.DoneCallback) {
      const wrapper = mountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={7}
          caller={mockCaller}
          hookAfterClick={() => { }}
          canEditBlockNumbers={true}
          entity={ENTITY_TYPE.CALL_LOG}
        />
      )
      expect(wrapper.find(Block).exists()).toBeTruthy();

      setTimeout(() => {
        wrapper.update();
        expect(wrapper.find(Block).exists()).toBeFalsy();
        done();
      }, 0)
    }

    @test('should hide block/unblock button when isBlock [JPT-2416]')
    t4() {
      const wrapper = mountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={7}
          caller={{} as Caller}
          hookAfterClick={() => { }}
          canEditBlockNumbers={true}
          entity={ENTITY_TYPE.CALL_LOG}
        />
      )
      expect(wrapper.find(Block).exists()).toBeFalsy();
    }
  }
})
