/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-07-23 14:07:30
 * Copyright © RingCentral. All rights reserved.
 */

import i18nT from '@/utils/i18nT';
import { showRCDownloadDialog } from '../utils';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { container, injectable, decorate } from 'framework/ioc';
import { jupiter } from 'framework/Jupiter';
import { config } from '../../module.config';
import { CLIENT_SERVICE } from '@/modules/common/interface';
import { ClientService } from '@/modules/common';
import { Notification } from '@/modules/message/container/ConversationPost/Notification';
import { Dialog } from '@/containers/Dialog';

jest.mock('@/utils/i18nT');
jest.mock('@/containers/Notification');
jest.mock('@/modules/common');

let param;

const mockedRCInfoService = {
  get: jest.fn(),
  getCallerIdList: jest.fn(),
  getForwardingNumberList: jest.fn(),
  isRCFeaturePermissionEnabled: jest.fn(),
  isVoipCallingAvailable: jest.fn().mockReturnValue(true),
  hasSetCallerId: jest.fn(),
  generateWebSettingUri: jest.fn(() => ''),
};
jest
  .spyOn(ServiceLoader, 'getInstance')
  .mockImplementation(() => mockedRCInfoService);
jupiter.registerModule(config);
jupiter.registerService(CLIENT_SERVICE, ClientService);
Notification.flashToast = jest.fn().mockImplementation();

jest.mock('@/containers/Dialog', () => {
  class Dialog {
    static confirm(obj) {
      const startLoading = jest.fn();
      const stopLoading = jest.fn();
      param = obj;
      return {
        startLoading,
        stopLoading,
      };
    }
  }

  return {
    __esModule: true,
    Dialog,
    withEscTracking: jest.fn(),
  };
});

describe('showRCDownloadDialog', () => {
  it('should call mock functions', async () => {
    await showRCDownloadDialog();
    expect(i18nT).toHaveBeenCalled();

    await param.onOK();

    expect(mockedRCInfoService.generateWebSettingUri).toHaveBeenCalled();
    expect(Notification.flashToast).not.toHaveBeenCalled();
  });
});
