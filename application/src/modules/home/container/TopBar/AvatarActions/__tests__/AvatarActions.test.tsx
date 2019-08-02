/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-22 10:25:30
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { mountWithTheme } from 'shield/utils';
import { testable, test } from 'shield';
import { mockService } from 'shield/sdk';
import { mockGlobalValue, mockPresence } from 'shield/application';
import { PRESENCE } from 'sdk/module/presence/constant';
import { Avatar } from '@/containers/Avatar';
import { AvatarActions } from '../AvatarActions';

jest.mock('sdk/module/person');

describe('AvatarActions', () => {

  @testable
  class tooltip {
    @test('should be presence.available when presence is PRESENCE.AVAILABLE')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.AVAILABLE)
    t1() {
      const wrapper = mountWithTheme(<AvatarActions />);
      expect(wrapper.find(Avatar).props().tooltip).toBe('presence.available');
    }

    @test('should be presence.doNotDisturb when presence is PRESENCE.DND')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.DND)
    t2() {
      const wrapper = mountWithTheme(<AvatarActions />);
      expect(wrapper.find(Avatar).props().tooltip).toBe('presence.doNotDisturb');
    }

    @test('should be presence.offline when presence is PRESENCE.UNAVAILABLE')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.UNAVAILABLE)
    t3() {
      const wrapper = mountWithTheme(<AvatarActions />);
      expect(wrapper.find(Avatar).props().tooltip).toBe('presence.offline');
    }

    @test('should be presence.inMeeting when presence is PRESENCE.INMEETING')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.INMEETING)
    t4() {
      const wrapper = mountWithTheme(<AvatarActions />);
      expect(wrapper.find(Avatar).props().tooltip).toBe('presence.inMeeting');
    }

    @test('should be presence.onCall when presence is PRESENCE.ONCALL')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.ONCALL)
    t5() {
      const wrapper = mountWithTheme(<AvatarActions />);
      expect(wrapper.find(Avatar).props().tooltip).toBe('presence.onCall');
    }

    @test('should be presence.offline when presence is PRESENCE.NOTREADY')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.NOTREADY)
    t6() {
      const wrapper = mountWithTheme(<AvatarActions />);
      expect(wrapper.find(Avatar).props().tooltip).toBe('presence.offline');
    }
  }
});
