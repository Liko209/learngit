/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 14:56:57
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { LeftRail } from '..';
import { mountWithTheme } from 'shield/utils';
import { test, testable } from 'shield';
import { MISSED_CALL_BADGE_ID } from 'sdk/module/RCItems/callLog/constants';
import { PhoneUMI } from '../../PhoneUMI';
import { mockEntity, mockSingleEntity } from 'shield/application';
import { CALLING_OPTIONS } from 'sdk/module/profile';
import { jupiter } from 'framework/Jupiter';
import { AppStore } from '@/modules/app/store';

jest.mock('sdk/dao');
jest.mock('sdk/api');
jest.mock('@/store/utils');
jest.mock('sdk/module/config');

describe('LeftRail', () => {
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
  class JPT2066 {
    @test('should Check can display the UMI in the call history tab when mount')
    @mockSingleEntity(CALLING_OPTIONS.GLIP)
    @mockEntity(entityMock)
    t1() {
      const wrapper = mountWithTheme(<LeftRail current="" />);
      expect(wrapper.find(PhoneUMI).length).toBe(2);

      const callHistoryUMI = wrapper.find(PhoneUMI).at(0);
      expect(callHistoryUMI.text()).toBe(`${mockMissedCall}`);
    }
  }

  @testable
  class JPT2102 {
    @test('should Check can display the UMI in the voicemails tab when mount')
    @mockEntity(entityMock)
    @mockSingleEntity(CALLING_OPTIONS.GLIP)
    t1() {
      const wrapper = mountWithTheme(<LeftRail current="" />);
      expect(wrapper.find(PhoneUMI).length).toBe(2);

      const voicemailUMI = wrapper.find(PhoneUMI).at(1);
      expect(voicemailUMI.text()).toBe(`${mockUnReadVoiceMail}`);
    }
  }

  @testable
  class JPT2105 {
    @test(
      `should Check shouldn't show UMI if the user has set "RingCentral Phone" as default app for phone features when mount`,
    )
    @mockSingleEntity(CALLING_OPTIONS.RINGCENTRAL)
    @mockEntity(entityMock)
    t1() {
      const wrapper = mountWithTheme(<LeftRail current="" />);
      expect(wrapper.find(PhoneUMI).length).toBe(2);
      const callHistoryUMI = wrapper.find(PhoneUMI).at(0);
      expect(callHistoryUMI.text()).toBe(null);
      const voicemailUMI = wrapper.find(PhoneUMI).at(1);
      expect(voicemailUMI.text()).toBe(null);
    }
  }
});
