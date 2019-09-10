/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-03 14:23:02
 * Copyright © RingCentral. All rights reserved.
 */

import { testable, test } from 'shield';
import { mockService } from 'shield/sdk';
import { Notification } from '@/containers/Notification';
import { ERROR_CODES_NETWORK, JNetworkError, JServerError, ERROR_CODES_SERVER } from 'sdk/error';
import { CallLogService } from 'sdk/module/RCItems/callLog';
import { VoicemailService } from 'sdk/module/RCItems/voicemail';
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { DeleteViewModel } from '../Delete.ViewModel';

jest.mock('@/containers/Notification');

const networkErrorFunc = () => {
  throw new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, 'NOT_NETWORK');
};

const serverErrorFunc = () => {
  throw new JServerError(ERROR_CODES_SERVER.GENERAL, 'GENERAL');
};

const checkNotification = (message: string) => ({
  message,
  autoHideDuration: 3000,
  dismissible: false,
  fullWidth: false,
  messageAlign: 'left',
  type: 'error',
});

describe('DeleteViewModel', () => {
  @testable
  class deleteVoicemail {
    @test('should toast error when delete voicemail fail for network issue [JPT-2231]')
    @mockService(VoicemailService, 'deleteVoicemails', networkErrorFunc)
    async t1() {
      const vm = new DeleteViewModel({ id: 2031622, type: BUTTON_TYPE.MENU_ITEM });
      await vm.deleteVoicemail();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('voicemail.prompt.notAbleToDeleteVoicemailForNetworkIssue'),
      );
    }

    @test('should toast error when delete voicemail fail for server issue [JPT-2232]')
    @mockService(VoicemailService, 'deleteVoicemails', serverErrorFunc)
    async t2() {
      const vm = new DeleteViewModel({ id: 2031622, type: BUTTON_TYPE.MENU_ITEM });
      await vm.deleteVoicemail();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('voicemail.prompt.notAbleToDeleteVoicemailForServerIssue'),
      );
    }
  }

  @testable
  class deleteCallLog {
    @test('should toast error when delete call log fail for network issue [JPT-2355]')
    @mockService(CallLogService, 'deleteCallLogs', networkErrorFunc)
    async t1() {
      const vm = new DeleteViewModel({ id: 2031622, type: BUTTON_TYPE.MENU_ITEM });
      await vm.deleteCallLog();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('calllog.prompt.notAbleToDeleteCallLogForNetworkIssue'),
      );
    }

    @test('should toast error when delete call log fail for server issue [JPT-2356]')
    @mockService(CallLogService, 'deleteCallLogs', serverErrorFunc)
    async t2() {
      const vm = new DeleteViewModel({ id: 2031622, type: BUTTON_TYPE.MENU_ITEM });
      await vm.deleteCallLog();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        checkNotification('calllog.prompt.notAbleToDeleteCallLogForServerIssue'),
      );
    }
  }
});
