/*
 * @Author: Paynter Chen
 * @Date: 2019-08-26 14:46:03
 * Copyright © RingCentral. All rights reserved.
 */
import { CrashManager } from '../CrashManager';
import { Pal } from 'sdk/pal';

jest.mock('sdk/pal');

describe('CrashManager', () => {
  window.addEventListener = jest.fn();
  window.removeEventListener = jest.fn();
  const whiteScreenChecker = {
    isWhiteScreen: jest.fn(),
  };
  const prepare = () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    Pal.instance = {
      getWhiteScreenChecker: () => whiteScreenChecker,
    };
  };
  describe('monitor()', () => {
    beforeEach(prepare);
    it('should listener to error, unhandledrejection', () => {
      const crashManager = new CrashManager();
      crashManager.monitor();
      expect(window.addEventListener).toHaveBeenCalledWith(
        'error',
        expect.anything(),
      );
      expect(window.addEventListener).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.anything(),
      );
    });
  });
  describe('dispose()', () => {
    beforeEach(prepare);
    it('should remove listener to error, unhandledrejection', () => {
      const crashManager = new CrashManager();
      crashManager.dispose();
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'error',
        expect.anything(),
      );
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.anything(),
      );
    });
  });
  describe('onCrash()', () => {
    beforeEach(prepare);
    it('should not call whiteScreenHandler when is not white screen', () => {
      const crashManager = new CrashManager();
      whiteScreenChecker.isWhiteScreen.mockReturnValue(false);
      jest.spyOn(crashManager['_whiteScreenHandler'], 'onCrash');
      crashManager.onCrash();
      expect(
        crashManager['_whiteScreenHandler']['onCrash'],
      ).not.toHaveBeenCalled();
    });
    it('should not call whiteScreenHandler when is white screen', () => {
      const crashManager = new CrashManager();
      whiteScreenChecker.isWhiteScreen.mockReturnValue(true);
      jest.spyOn(crashManager['_whiteScreenHandler'], 'onCrash');
      crashManager._onCrash();
      expect(crashManager['_whiteScreenHandler']['onCrash']).toHaveBeenCalled();
    });
  });
});
