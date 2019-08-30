/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-26 09:16:38
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import { mountWithTheme, asyncMountWithTheme } from 'shield/utils';
import { mockEntity } from 'shield/application';
import { mockService } from 'shield/sdk';
import { JuiIconButton } from 'jui/components/Buttons';
import { PHONE_NUMBER_TYPE } from 'sdk/module/person/entity';
import { RCInfoService } from 'sdk/module/rcInfo';
import React from 'react';
import { ENTITY_NAME } from '@/store';
import { READ_STATUS } from 'sdk/module/RCItems/constants';
import { ATTACHMENT_TYPE } from 'sdk/module/RCItems/constants';
import { Caller } from 'sdk/module/RCItems/types';
import { PersonService } from 'sdk/module/person';

import { Actions } from '../Actions';
import { ENTITY_TYPE } from '../../constants';
import { Block } from '../Block';
import { Message } from '../Message';
import { Delete } from '../Delete';
import { More } from '../More';
import { Call } from '../Call';
import { Download } from '../Download';
import { Read } from '../Read';

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
} as Caller;

describe('Action', () => {
  @testable
  class init {
    @test(
      'should show block/unblock button when user has block/unblock permission and phone number is correct [JPT-2408-Step1/JPT-2409-Step1]',
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
          canEditBlockNumbers
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      wrapper.update();
      expect(wrapper.find(Block).exists()).toBeTruthy();
    }

    @test(
      'should hide block/unblock button when user does not have block/unblock permission [JPT-2414]',
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
          canEditBlockNumbers={false}
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      expect(wrapper.find(Block).exists()).toBeFalsy();
    }

    @test(
      'should hide block/unblock button when number is Extension number [JPT-2415]',
    )
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
          canEditBlockNumbers
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      expect(wrapper.find(Block).exists()).toBeTruthy();

      setTimeout(() => {
        wrapper.update();
        expect(wrapper.find(Block).exists()).toBeFalsy();
        done();
      }, 0);
    }

    @test('should hide block/unblock button when isBlock [JPT-2416]')
    t4() {
      const wrapper = mountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={7}
          caller={{} as Caller}
          canEditBlockNumbers
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      expect(wrapper.find(Block).exists()).toBeFalsy();
    }
  }

  @testable
  class JPT2406 {
    @test('should not show message button if no permission')
    t1() {
      const wrapper = mountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={7}
          caller={{} as Caller}
          canEditBlockNumbers
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      expect(wrapper.find(Message).exists()).toBeFalsy();
    }

    @test('should show message button if has permission')
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
    async t2() {
      const wrapper = await asyncMountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={7}
          caller={mockCaller}
          canEditBlockNumbers
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      wrapper.update();
      expect(wrapper.find(Message).exists()).toBeTruthy();
    }
  }

  @testable
  class JPT2373 {
    @test('should not show call button if isBlock')
    t1() {
      const wrapper = mountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={7}
          caller={{} as Caller}
          showCall
          canEditBlockNumbers
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      expect(wrapper.find(Call).exists()).toBeFalsy();
    }
  }

  @testable
  class JPT2384 {
    @test('should not show call button if not permission')
    t1() {
      const wrapper = mountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={7}
          caller={{} as Caller}
          showCall={false}
          canEditBlockNumbers
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      expect(wrapper.find(Call).exists()).toBeFalsy();
    }
  }

  @testable
  class JPT2364 {
    @test('should show call button if has permission and not block')
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
          showCall
          canEditBlockNumbers
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      expect(wrapper.find(Call).exists()).toBeTruthy();
    }
  }

  @testable
  class JPT2366 {
    @test(
      'should show Call, Message, Delete, Block/Unblock in order when item is call log item [JPT-2366]',
    )
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
      }),
    )
    @mockService(RCInfoService, 'isNumberBlocked', false)
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    async t1() {
      const wrapper = await asyncMountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={4}
          caller={mockCaller}
          showCall={true}
          canEditBlockNumbers={true}
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      wrapper.update();
      expect(wrapper.find(JuiIconButton)).toHaveLength(4);
      expect(
        wrapper
          .find(JuiIconButton)
          .at(0)
          .props().children,
      ).toBe('phone');
      expect(
        wrapper
          .find(JuiIconButton)
          .at(1)
          .props().children,
      ).toBe('chat_bubble');
      expect(
        wrapper
          .find(JuiIconButton)
          .at(2)
          .props().children,
      ).toBe('delete-call');
      expect(
        wrapper
          .find(JuiIconButton)
          .at(3)
          .props().children,
      ).toBe('blocked');
    }

    @test(
      'should show Message, Call, Delete in order when item is call log item [JPT-2366]',
    )
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
      }),
    )
    @mockService(RCInfoService, 'isNumberBlocked', false)
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    async t2() {
      const wrapper = await asyncMountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={3}
          caller={mockCaller}
          showCall={true}
          canEditBlockNumbers={false}
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      wrapper.update();
      expect(wrapper.find(JuiIconButton)).toHaveLength(3);
      expect(
        wrapper
          .find(JuiIconButton)
          .at(0)
          .props().children,
      ).toBe('phone');
      expect(
        wrapper
          .find(JuiIconButton)
          .at(1)
          .props().children,
      ).toBe('chat_bubble');
      expect(
        wrapper
          .find(JuiIconButton)
          .at(2)
          .props().children,
      ).toBe('delete-call');
      expect(wrapper.find(Block).exists()).toBeFalsy();
    }
  }

  @testable
  class JPT2419 {
    @test(
      'should show Call, Message, Delete, Read/Unread, Download, More(Block/Unblock) in order when item is voicemail item [JPT-2419]',
    )
    @mockEntity({
      ...mockPhoneAndPerson({
        person: {
          userDisplayName: 'displayName',
          phoneNumbers: [
            {
              type: PHONE_NUMBER_TYPE.EXTENSION_NUMBER,
              phoneNumber: '+1234567890',
            },
          ],
        },
      }),
      readStatus: READ_STATUS.READ,
      attachments: [
        {
          uri: 'uri',
          type: ATTACHMENT_TYPE.AUDIO_RECORDING,
        },
      ],
    })
    @mockService(RCInfoService, 'isNumberBlocked', false)
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    async t1() {
      let Comp;
      const wrapper = await asyncMountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={4}
          caller={mockCaller}
          showCall={true}
          canEditBlockNumbers={true}
          entity={ENTITY_TYPE.VOICEMAIL}
        />,
      );
      wrapper.update();
      expect(wrapper.find(JuiIconButton)).toHaveLength(4);
      expect(
        wrapper
          .find(JuiIconButton)
          .at(0)
          .props().children,
      ).toBe('phone');
      expect(
        wrapper
          .find(JuiIconButton)
          .at(1)
          .props().children,
      ).toBe('chat_bubble');
      expect(
        wrapper
          .find(JuiIconButton)
          .at(2)
          .props().children,
      ).toBe('delete-call');
      expect(
        wrapper
          .find(JuiIconButton)
          .at(3)
          .props().children,
      ).toBe('more_horiz');


      const moreProps = wrapper.find(More).props();
      expect(moreProps.children).toHaveLength(3);

      Comp = moreProps.children[0].type;
      expect(<Comp />).toEqual(<Read />);

      Comp = moreProps.children[1].type;
      expect(<Comp />).toEqual(<Download />);

      Comp = moreProps.children[2].type;
      expect(<Comp />).toEqual(<Block />);
    }

  }

  @testable
  class JPT2504 {
    @test(
      'should show Delete when item is real call log [JPT-2504]',
    )
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
      }),
    )
    @mockService(RCInfoService, 'isNumberBlocked', false)
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    async t1() {
      const wrapper = await asyncMountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={3}
          caller={mockCaller}
          showCall={true}
          canEditBlockNumbers={false}
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      wrapper.update();
      expect(wrapper.find(JuiIconButton)).toHaveLength(3);
      expect(
        wrapper
          .find(JuiIconButton)
          .at(0)
          .props().children,
      ).toBe('phone');
      expect(
        wrapper
          .find(JuiIconButton)
          .at(1)
          .props().children,
      ).toBe('chat_bubble');
      expect(
        wrapper
          .find(JuiIconButton)
          .at(2)
          .props().children,
      ).toBe('delete-call');
    }

    @test(
      'should not show Delete when item is real call log [JPT-2504]',
    )
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
      }),
    )
    @mockService(RCInfoService, 'isNumberBlocked', false)
    @mockService(PersonService, 'matchContactByPhoneNumber', { id: 1 })
    async t2() {
      const wrapper = await asyncMountWithTheme(
        <Actions
          id={1234}
          maxButtonCount={3}
          caller={mockCaller}
          showCall={true}
          canEditBlockNumbers={false}
          isPseudo={true}
          entity={ENTITY_TYPE.CALL_LOG}
        />,
      );
      wrapper.update();
      expect(wrapper.find(JuiIconButton)).toHaveLength(2);
      expect(
        wrapper
          .find(JuiIconButton)
          .at(0)
          .props().children,
      ).toBe('phone');
      expect(
        wrapper
          .find(JuiIconButton)
          .at(1)
          .props().children,
      ).toBe('chat_bubble');
      expect(wrapper.find(Delete).exists()).toBeFalsy();
    }
  }
});
