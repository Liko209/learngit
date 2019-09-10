/*
 * @Author: Paynter Chen
 * @Date: 2019-08-26 14:46:03
 * Copyright © RingCentral. All rights reserved.
 */
import { CrashGlobalConfig } from '../CrashGlobalConfig';
import { AccountManager } from 'sdk/framework/account';
import { container } from 'sdk/container';
import { WhiteScreenHandler } from '../WhiteScreenHandler';

jest.mock('../CrashGlobalConfig');

describe('WhiteScreenHandler', () => {
  describe('onCrash()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });
    it('should not handle when whiteScreen times space < 3', async () => {
      CrashGlobalConfig.getWhiteScreenTimes.mockReturnValue(0);
      CrashGlobalConfig.getLastWhiteScreenTime.mockReturnValue({
        count: 0,
        timeStamp: 0,
      });
      CrashGlobalConfig.getLastWhiteScreenTime.mockReturnValue(0);
      const whiteScreenHandler = new WhiteScreenHandler();
      jest.spyOn(whiteScreenHandler, 'handleWhiteScreen');
      await whiteScreenHandler.onCrash();
      expect(CrashGlobalConfig.setWhiteScreenTimes).toHaveBeenCalledWith(1);
      expect(whiteScreenHandler.handleWhiteScreen).not.toHaveBeenCalled();
    });
    it('should not handle when whiteScreen times space < 3', async () => {
      CrashGlobalConfig.getWhiteScreenTimes.mockReturnValue(1);
      CrashGlobalConfig.getLastWhiteScreenTime.mockReturnValue({
        count: 0,
        timeStamp: 0,
      });
      const whiteScreenHandler = new WhiteScreenHandler();
      jest.spyOn(whiteScreenHandler, 'handleWhiteScreen');
      await whiteScreenHandler.onCrash();
      expect(CrashGlobalConfig.setWhiteScreenTimes).toHaveBeenCalledWith(2);
      expect(whiteScreenHandler.handleWhiteScreen).not.toHaveBeenCalled();
    });

    it('should handle when whiteScreen times space >= 3', async () => {
      CrashGlobalConfig.getWhiteScreenTimes.mockReturnValue(2);
      CrashGlobalConfig.getLastWhiteScreenTime.mockReturnValue({
        count: 0,
        timeStamp: 0,
      });
      const whiteScreenHandler = new WhiteScreenHandler();
      jest
        .spyOn(whiteScreenHandler, 'handleWhiteScreen')
        .mockImplementation(async () => {});
      await whiteScreenHandler.onCrash();
      expect(CrashGlobalConfig.setWhiteScreenTimes).toHaveBeenCalledWith(3);
      expect(whiteScreenHandler.handleWhiteScreen).toHaveBeenCalled();
    });

    it('should only handle one time in one session', async () => {
      CrashGlobalConfig.getWhiteScreenTimes.mockReturnValue(2);
      CrashGlobalConfig.getLastWhiteScreenTime.mockReturnValue({
        count: 0,
        timeStamp: 0,
      });
      const whiteScreenHandler = new WhiteScreenHandler();
      jest
        .spyOn(whiteScreenHandler, 'handleWhiteScreen')
        .mockImplementation(async () => {});
      await whiteScreenHandler.onCrash();
      await whiteScreenHandler.onCrash();
      expect(whiteScreenHandler.handleWhiteScreen).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleWhiteScreen() [JPT-2900]', () => {
    let registration: any;
    let accountManager: AccountManager;
    const setup = () => {
      registration = {
        unregister: jest.fn(),
      };
      global.caches = {
        keys: () => Promise.resolve(['a', 'b']),
        delete: jest.fn(),
      };
      global.navigator.serviceWorker = {
        getRegistration: () => registration,
      };
      global.location.reload = jest.fn();
      accountManager = {
        logout: jest.fn(),
        onForceLogout: jest.fn(),
      } as any;
      container.get = () => accountManager as any;
    };
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      setup();
    });
    it('should clear caches', async () => {
      const whiteScreenHandler = new WhiteScreenHandler();
      await whiteScreenHandler.handleWhiteScreen();
      expect(caches.delete).toHaveBeenNthCalledWith(1, 'a');
      expect(caches.delete).toHaveBeenNthCalledWith(2, 'b');
    });
    it('should logout', async () => {
      const whiteScreenHandler = new WhiteScreenHandler();
      await whiteScreenHandler.handleWhiteScreen();
      expect(accountManager.onForceLogout).toHaveBeenCalledTimes(1);
    });
    it('should unregister serviceWorker', async () => {
      const whiteScreenHandler = new WhiteScreenHandler();
      await whiteScreenHandler.handleWhiteScreen();
      expect(registration.unregister).toHaveBeenCalledTimes(1);
    });
  });
});
