/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-23 01:48:27
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { mountWithTheme } from 'shield/utils';
import { testable, test } from 'shield';
import { PRESENCE } from 'sdk/module/presence/constant';
import { JuiSnackbarContent, JuiSnackbarAction } from 'jui/components/Snackbars';
import { mockPresence, mockGlobalValue } from 'shield/application';
import { mockService } from 'shield/sdk';
import { DndBanner } from '../DndBanner';

const presenceService = {
  name: ServiceConfig.PRESENCE_SERVICE,
  setPresence: jest.fn(),
}

jest.mock('@/AnalyticsCollector');

describe('DndBanner', () => {
  @testable
  class View {
    @test('should not show banner when presence is not dnd')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.AVAILABLE)
    t1() {
      const wrapper = mountWithTheme(<DndBanner />);
      expect(wrapper.find(JuiSnackbarContent)).toHaveLength(0);
    }
    @test('should be warn type when render the banner')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.DND)
    t2() {
      const wrapper = mountWithTheme(<DndBanner />);
      expect(wrapper.find(JuiSnackbarContent)).toHaveLength(1);
      expect(wrapper.find(JuiSnackbarContent).props().type).toBe('warn');
      expect(wrapper.find(JuiSnackbarContent).props().message).toBe('presence.prompt.topBannerInfoWhenDnd');
    }
  }

  @testable
  class close {
    @test('should not show banner when user click Close button')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.DND)
    async t1() {
      const wrapper = mountWithTheme(<DndBanner />);
      await wrapper.find(JuiSnackbarContent).find(JuiSnackbarAction).at(1).simulate('click');
      expect(wrapper.find(JuiSnackbarContent)).toHaveLength(0);
    }
  }

  @testable
  class unblock {
    @test('should not show banner when user click Unblock button')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.DND)
    @mockService(presenceService)
    async t1() {
      const wrapper = mountWithTheme(<DndBanner />);
      await wrapper.find(JuiSnackbarContent).find(JuiSnackbarAction).at(0).simulate('click');
      expect(presenceService.setPresence).toHaveBeenCalled();

    }
  }
});
