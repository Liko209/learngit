/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-22 10:25:30
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { mountWithTheme } from 'shield/utils';
import { shallow } from 'enzyme';
import { testable, test } from 'shield';
import { mockGlobalValue, mockEntity } from 'shield/application';
import { PRESENCE } from 'sdk/module/presence/constant';
import { Avatar } from '@/containers/Avatar';
import { AvatarActions } from '../AvatarActions';
import { AvatarActionsView } from '../AvatarActions.View';

describe('AvatarActions', () => {

  @testable
  class tooltip {
    @test('should be presence.available when presence is PRESENCE.AVAILABLE')
    @mockGlobalValue(1)
    @mockEntity({
      presence: PRESENCE.AVAILABLE,
      deactivated: false
    })
    t1() {
      const wrapper = mountWithTheme(<AvatarActions />);
      expect(wrapper.find(Avatar).props().tooltip).toBe('presence.available');
    }

    @test('should be presence.doNotDisturb when presence is PRESENCE.DND')
    @mockGlobalValue(1)
    @mockEntity({
      presence: PRESENCE.DND,
      deactivated: false
    })
    t2() {
      const wrapper = mountWithTheme(<AvatarActions />);
      expect(wrapper.find(Avatar).props().tooltip).toBe('presence.doNotDisturb');
    }

    @test('should be presence.offline when presence is PRESENCE.UNAVAILABLE')
    @mockGlobalValue(1)
    @mockEntity({
      presence: PRESENCE.UNAVAILABLE,
      deactivated: false
    })
    t3() {
      const wrapper = mountWithTheme(<AvatarActions />);
      expect(wrapper.find(Avatar).props().tooltip).toBe('presence.offline');
    }

    @test('should be presence.inMeeting when presence is PRESENCE.INMEETING')
    @mockGlobalValue(1)
    @mockEntity({
      presence: PRESENCE.INMEETING,
      deactivated: false
    })
    t4() {
      const wrapper = mountWithTheme(<AvatarActions />);
      expect(wrapper.find(Avatar).props().tooltip).toBe('presence.inMeeting');
    }

    @test('should be presence.onCall when presence is PRESENCE.ONCALL')
    @mockGlobalValue(1)
    @mockEntity({
      presence: PRESENCE.ONCALL,
      deactivated: false
    })
    t5() {
      const wrapper = mountWithTheme(<AvatarActions />);
      expect(wrapper.find(Avatar).props().tooltip).toBe('presence.onCall');
    }

    @test('should be presence.offline when presence is PRESENCE.NOTREADY')
    @mockGlobalValue(1)
    @mockEntity({
      presence: PRESENCE.NOTREADY,
      deactivated: false
    })
    t6() {
      const wrapper = mountWithTheme(<AvatarActions />);
      expect(wrapper.find(Avatar).props().tooltip).toBe('presence.offline');
    }
  }
});
