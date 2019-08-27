/*
 * @Author: isaac.liu
 * @Date: 2019-05-29 14:10:31
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { PhoneUMI } from '..';
import { PhoneUMIType } from '../types';
import { mountWithTheme } from 'shield/utils';
import { test, testable } from 'shield';
import { mockEntity, mockSingleEntity } from 'shield/application';
import { MISSED_CALL_BADGE_ID } from 'sdk/module/RCItems/callLog/constants';
import { CALLING_OPTIONS } from 'sdk/module/profile';
import { jupiter } from 'framework/Jupiter';
import { AppStore } from '@/modules/app/store';

jest.mock('sdk/dao');
jest.mock('sdk/api');
jest.mock('@/store/utils');

describe('PhoneUMI', () => {
  jupiter.registerClass(AppStore);

  const mockMissedCall = 10;
  const mockUnReadVoiceMail = 3;
  const entityMock = (name: string, id: string) => {
    if (id === MISSED_CALL_BADGE_ID) {
      return { unreadCount: mockMissedCall };
    }
    return { unreadCount: mockUnReadVoiceMail };
  };
  @testable
  class umi {
    @test(
      'should show UMI of missed call & unread voicemail when mount, [JPT-2103]',
    )
    @mockEntity(entityMock)
    @mockSingleEntity(CALLING_OPTIONS.GLIP)
    t1() {
      const wrapper = mountWithTheme(<PhoneUMI type={PhoneUMIType.ALL}/>);
      expect(wrapper.text()).toBe(`${mockMissedCall + mockUnReadVoiceMail}`);
    }

    @test('should show UMI of missed call if type is MISSEDCALL, [JPT-2103]')
    @mockEntity(entityMock)
    @mockSingleEntity(CALLING_OPTIONS.GLIP)
    t2() {
      const wrapper = mountWithTheme(
        <PhoneUMI type={PhoneUMIType.MISSEDCALL} />,
      );
      expect(wrapper.text()).toBe(`${mockMissedCall}`);
    }

    @test('should show UMI of voicemail if type is VOICEMAIL, [JPT-2103]')
    @mockEntity(entityMock)
    @mockSingleEntity(CALLING_OPTIONS.GLIP)
    t3() {
      const wrapper = mountWithTheme(
        <PhoneUMI type={PhoneUMIType.VOICEMAIL} />,
      );
      expect(wrapper.text()).toBe(`${mockUnReadVoiceMail}`);
    }
  }
});
