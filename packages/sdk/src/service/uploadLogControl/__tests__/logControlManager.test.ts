/*
 * @Author: Lip Wang (lip.wangn@rin gcentral.com)
 * @Date: 2018-07-12 16:15:14
 * Copyright © RingCentral. All rights reserved
 */

import axios from 'axios';
import { PermissionService } from '../../../module/permission';
import LogControlManager from '../logControlManager';
import { logManager, LOG_LEVEL, mainLogger, IAccessor } from 'foundation';
import { notificationCenter } from 'sdk/service';
import { WINDOW, ENTITY, SERVICE } from '../../../service/eventKey';

jest.mock('axios');
jest.mock('sdk/module/permission/service/PermissionService');
jest.mock('foundation');
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
  setAllLoggerLevel: jest.fn(),
};
logManager = mockLogManager;
mainLogger = mockLogger;

describe('LogControlManager', () => {
  const logControlManager = LogControlManager.instance();
  logControlManager.setDebugMode(true);
  beforeEach(() => {
    axios.mockResolvedValue({});
  });

  describe('instance()', () => {
    it('should return instance when call instance()', async () => {
      expect(LogControlManager.instance()).toBeInstanceOf(LogControlManager);
    });
  });

  describe('notifications', () => {
    it('should call configByPermission when receive ENTITY.USER_PERMISSION event', () => {
      const spy = jest.spyOn(logControlManager, 'configByPermission');
      spy.mockClear();
      notificationCenter.emit(ENTITY.USER_PERMISSION);
      expect(spy).toBeCalledTimes(1);
    });
    it('should call setNetworkState when receive WINDOW.ONLINE event', () => {
      const spy = jest.spyOn(logControlManager, 'setNetworkState');
      spy.mockClear();
      notificationCenter.emit(WINDOW.ONLINE, { onLine: false });
      expect(spy).toBeCalledTimes(1);
      expect(spy).nthCalledWith(1, false);
      notificationCenter.emit(WINDOW.ONLINE, { onLine: true });
      expect(spy).toBeCalledTimes(2);
      expect(spy).nthCalledWith(2, true);
    });
    it('should call flush when receive SERVICE.LOGOUT event', () => {
      const spy = jest.spyOn(logControlManager, 'flush');
      spy.mockClear();
      notificationCenter.emit(SERVICE.LOGOUT);
      expect(spy).toBeCalledTimes(1);
    });
    it('should call flush when receive WINDOW.BLUR event', () => {
      const spy = jest.spyOn(logControlManager, 'flush');
      spy.mockClear();
      notificationCenter.emit(WINDOW.BLUR);
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('configByPermission()', () => {
    it('should set log config when getUserPermission success [JPT-1178]', async () => {
      const mockPermissionService = {
        hasPermission: jest.fn(),
      };
      PermissionService.getInstance = jest
        .fn()
        .mockReturnValue(mockPermissionService);
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

    it('Should be able to show error info when getting permission service fail. [JPT-1179]', async () => {
      const mockPermissionService = {
        hasPermission: jest.fn(),
      };
      PermissionService.getInstance = jest
        .fn()
        .mockReturnValue(mockPermissionService);
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
