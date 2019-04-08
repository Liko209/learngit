/*
 * @Author: Lip Wang (lip.wangn@rin gcentral.com)
 * @Date: 2018-07-12 16:15:14
 * Copyright © RingCentral. All rights reserved
 */

import axios from 'axios';
import { logManager, mainLogger } from 'foundation/src/log/index';
import { notificationCenter } from 'sdk/service';
import { PermissionService } from '../../../module/permission';
import { ENTITY, SERVICE, WINDOW } from '../../../service/eventKey';
import { LogControlManager } from '../logControlManager';
import { configManager } from '../consumer/config';
import { logEntityFactory } from 'foundation/src/log/__tests__/factory';

jest.mock('axios');
jest.mock('sdk/module/permission/service/PermissionService');

describe('LogControlManager', () => {
  const logControlManager = LogControlManager.instance();
  logControlManager.setDebugMode(true);
  beforeEach(() => {
    jest.clearAllMocks();
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
      const spyLogManagerConfig = jest.spyOn(logManager, 'config');
      const spyConfigManagerMergeConfig = jest.spyOn(
        configManager,
        'mergeConfig',
      );
      await logControlManager.configByPermission();
      expect(spyLogManagerConfig).toHaveBeenLastCalledWith({
        browser: { enabled: false },
      });
      expect(spyConfigManagerMergeConfig).toHaveBeenLastCalledWith({
        uploadEnabled: false,
      });
      expect(mockPermissionService.hasPermission).toHaveBeenCalledTimes(2);
      mockPermissionService.hasPermission.mockResolvedValue(true);
      await logControlManager.configByPermission();
      expect(spyLogManagerConfig).toHaveBeenLastCalledWith({
        browser: { enabled: true },
      });
      expect(spyConfigManagerMergeConfig).toHaveBeenLastCalledWith({
        uploadEnabled: true,
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
      // main.warn.mockClear();
      const spyMainLoggerWarn = jest.spyOn(mainLogger, 'warn');
      const spyLogManagerConfig = jest.spyOn(logManager, 'config');
      // mockLogManager.config.mockClear();
      mockPermissionService.hasPermission.mockRejectedValue({});
      await logControlManager.configByPermission();
      expect(spyMainLoggerWarn).toBeCalled();
      expect(spyLogManagerConfig).not.toHaveBeenCalled();
      expect(mockPermissionService.hasPermission).toHaveBeenCalledTimes(1);
    });
  });
  describe('_filterBlackList()', () => {
    it('should filter black list tag', () => {
      LogControlManager.instance().addTag2BlackList('a');
      expect(
        LogControlManager.instance()['_blackListFilter'](
          logEntityFactory.build({
            tags: ['a', 'b'],
          }),
        ),
      ).toBeTruthy();
      expect(
        LogControlManager.instance()['_blackListFilter'](
          logEntityFactory.build({
            tags: ['c', 'd'],
          }),
        ),
      ).toBeFalsy();
      LogControlManager.instance().removeFromBlackList('a');
      expect(
        LogControlManager.instance()['_blackListFilter'](
          logEntityFactory.build({
            tags: ['a', 'b'],
          }),
        ),
      ).toBeFalsy();
    });
  });
  describe('_filterWhiteList()', () => {
    it('should filter white list tag', () => {
      LogControlManager.instance().addTag2WhiteList('a');
      expect(
        LogControlManager.instance()['_whiteListFilter'](
          logEntityFactory.build({
            tags: ['a', 'b'],
          }),
        ),
      ).toBeTruthy();
      expect(
        LogControlManager.instance()['_whiteListFilter'](
          logEntityFactory.build({
            tags: ['c', 'd'],
          }),
        ),
      ).toBeFalsy();
      LogControlManager.instance().removeFromWhiteList('a');
      expect(
        LogControlManager.instance()['_whiteListFilter'](
          logEntityFactory.build({
            tags: ['a', 'b'],
          }),
        ),
      ).toBeFalsy();
    });
  });
});
