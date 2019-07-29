/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-15 06:29:46
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { testable, test } from 'shield';
import { mountWithTheme } from 'shield/utils';
import { JuiSubMenu } from 'jui/components/Menus';
import { PRESENCE } from 'sdk/module/presence/constant';
import { PresenceMenuView } from '../PresenceMenu.View';

describe('PresenceMenuView', () => {
  @testable
  class JPT2560 {
    @test('should not display DND option when user is Freya [JPT-2560]')
    t1() {
      const wrapper = mountWithTheme(<PresenceMenuView presence={PRESENCE.AVAILABLE} isFreyja />)
      expect(wrapper.find(JuiSubMenu).props().children[0].props.children).toBe('presence.available');
      expect(wrapper.find(JuiSubMenu).props().children[1].props.children).toBe('presence.invisible');
      expect(wrapper.find(JuiSubMenu).props().children[2]).toBeFalsy();
    }

    @test('should display DND option when user is not Freya [JPT-2560]')
    t2() {
      const wrapper = mountWithTheme(<PresenceMenuView presence={PRESENCE.AVAILABLE} isFreyja={false} />)
      expect(wrapper.find(JuiSubMenu).props().children[0].props.children).toBe('presence.available');
      expect(wrapper.find(JuiSubMenu).props().children[1].props.children).toBe('presence.invisible');
      expect(wrapper.find(JuiSubMenu).props().children[2].props.children).toBe('presence.doNotDisturb');
    }
  }
})
