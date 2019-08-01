/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-25 07:16:52
 * Copyright © RingCentral. All rights reserved.
 */
import { mockPresence, mockGlobalValue } from 'shield/application';
import { ServiceConfig } from 'sdk/module/serviceLoader';
import { PRESENCE } from 'sdk/module/presence/constant';
import { mockService } from 'shield/sdk';
import { testable, test } from 'shield';
import { ActivityTimerViewModel } from '../ActivityTimer.ViewModel';

const presenceService = {
  name: ServiceConfig.PRESENCE_SERVICE,
  setAutoPresence: jest.fn(),
};

describe('ActivityTimer.ViewModel', () => {
  @testable
  class setOffline {
    @test('should set offline when presence is AVAILABLE [JPT-2626]')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.AVAILABLE)
    @mockService(presenceService, 'setAutoPresence', true)
    async t1() {
      const vm = new ActivityTimerViewModel({});
      await vm.setOffline();
      expect(presenceService.setAutoPresence).toHaveBeenCalled();
      expect(presenceService.setAutoPresence.mock.calls[0][0]).toBe(PRESENCE.UNAVAILABLE);
    }

    @test('should not set offline when presence is not AVAILABLE')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.UNAVAILABLE)
    @mockService(presenceService, 'setAutoPresence', true)
    async t2() {
      const vm = new ActivityTimerViewModel({});
      await vm.setOffline();
      expect(presenceService.setAutoPresence).not.toHaveBeenCalled();
    }
  }

  @testable
  class setOnline {
    @test('should set online when app is in offline mode [JPT-2652]')
    @mockGlobalValue(1)
    @mockPresence(PRESENCE.AVAILABLE)
    @mockService(presenceService, 'setAutoPresence', true)
    async t1() {
      const vm = new ActivityTimerViewModel({});
      vm.isOffline = true;
      await vm.setOnline();
      expect(presenceService.setAutoPresence).toHaveBeenCalled();
      expect(presenceService.setAutoPresence.mock.calls[0][0]).toBe(PRESENCE.AVAILABLE);
    }

    @test('should not set online when app is not in offline mode')
    @mockService(presenceService, 'setAutoPresence', true)
    async t2() {
      const vm = new ActivityTimerViewModel({});
      await vm.setOnline();
      expect(presenceService.setAutoPresence).not.toHaveBeenCalled();
    }
  }
});
