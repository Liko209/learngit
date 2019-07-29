/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-15 06:29:46
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceConfig } from 'sdk/module/serviceLoader';
import { testable, test } from 'shield';
import { mockService } from 'shield/sdk';
import { CompanyService } from 'sdk/module/company';
import { PresenceService } from 'sdk/module/presence';
import { Notification } from '@/containers/Notification';
import { networkErrorFunc, serverErrorFunc } from 'shield/utils';
import { PresenceMenuViewModel } from '../PresenceMenu.ViewModel';
import { PRESENCE } from 'sdk/module/presence/constant';

jest.mock('@/containers/Notification');

const presenceService = {
  name: ServiceConfig.PRESENCE_SERVICE, // must be set service name
  setPresence: jest.fn(),
};

const checkNotification = (message: string) => ({
  message,
  autoHideDuration: 3000,
  dismissible: false,
  fullWidth: false,
  messageAlign: 'left',
  type: 'error',
});

describe('PresenceMenuViewModel', () => {
  @testable
  class setPresence {
    @test('should toast error when update presence fail for network issue [JPT-2557]')
    @mockService(CompanyService, 'isFreyjaAccount', false)
    @mockService(PresenceService, 'setPresence', networkErrorFunc)
    async t1() {
      const vm = new PresenceMenuViewModel({
        presence: PRESENCE.AVALIABLE,
      });
      await vm.setPresence(PRESENCE.DND);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('presence.prompt.updatePresenceFailedForNetworkIssue'),
      );
    }

    @test('should toast error when update presence fail for network issue [JPT-2558]')
    @mockService(CompanyService, 'isFreyjaAccount', false)
    @mockService(PresenceService, 'setPresence', serverErrorFunc)
    async t2() {
      const vm = new PresenceMenuViewModel({
        presence: PRESENCE.AVALIABLE,
      });
      await vm.setPresence(PRESENCE.DND);
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('presence.prompt.updatePresenceFailedForServerIssue'),
      );
    }

    @test('should not call setPresence when presence equal to toPresence')
    @mockService(CompanyService, 'isFreyjaAccount', false)
    @mockService(presenceService)
    async t3() {
      const vm = new PresenceMenuViewModel({
        presence: PRESENCE.AVALIABLE,
      });
      await vm.setPresence(PRESENCE.AVALIABLE);
      expect(presenceService.setPresence).not.toHaveBeenCalled();
    }
  }
});
