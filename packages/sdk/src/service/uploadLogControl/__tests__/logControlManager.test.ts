/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-07-12 16:15:14
 * Copyright © RingCentral. All rights reserved
 */

import axios from 'axios';
import { PermissionService } from '../../../module/permission';
import LogControlManager from '../logControlManager';
import { logManager, LOG_LEVEL, mainLogger, IAccessor } from 'foundation';
jest.mock('axios');
jest.mock('sdk/module/permission/service/PermissionService');
jest.mock('foundation');
const mockPermissionService = {
  hasPermission: jest.fn(),
};
const mockLogger = {
  tags: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
};
mockLogger.tags.mockReturnValue(mockLogger);
const mockLogManager = {
  getMainLogger: jest.fn().mockReturnValue(mockLogger),
  getNetworkLogger: jest.fn().mockReturnValue(mockLogger),
  getConfig: jest.fn().mockReturnValue({}),
  config: jest.fn(),
};
logManager = mockLogManager;
mainLogger = mockLogger;

describe('LogControlManager', () => {
  const logControlManager = LogControlManager.instance();
  beforeEach(() => {
    axios.mockResolvedValue({});
    PermissionService.getInstance = jest
      .fn()
      .mockReturnValue(mockPermissionService);
  });
  it('instance', async () => {
    expect(LogControlManager.instance()).toBeInstanceOf(LogControlManager);
  });

  describe('configByPermission', () => {
    it('should set log config when getUserPermission success', async () => {
      mockPermissionService.hasPermission.mockClear();
      mockPermissionService.hasPermission.mockResolvedValue(false);
      await logControlManager.configByPermission();
      expect(mockLogManager.config).toHaveBeenLastCalledWith({
        browser: { enabled: false },
        consumer: { enabled: false },
      });
      expect(mockPermissionService.hasPermission).toHaveBeenCalledTimes(2);
      mockPermissionService.hasPermission.mockResolvedValue(true);
      await logControlManager.configByPermission();
      expect(mockLogManager.config).toHaveBeenLastCalledWith({
        browser: { enabled: true },
        consumer: { enabled: true },
      });
      expect(mockPermissionService.hasPermission).toHaveBeenCalledTimes(4);
    });

    it('should log when getUserPermission fail', async () => {
      mockPermissionService.hasPermission.mockClear();
      mockLogger.warn.mockClear();
      mockLogManager.config.mockClear();
      mockPermissionService.hasPermission.mockRejectedValue({});
      await logControlManager.configByPermission();
      expect(mockLogger.warn).toBeCalled();
      expect(mockLogManager.config).not.toHaveBeenCalled();
      expect(mockPermissionService.hasPermission).toHaveBeenCalledTimes(1);
    });
  });
});
