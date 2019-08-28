/*
 * @Author: Paynter Chen
 * @Date: 2019-08-26 14:46:03
 * Copyright © RingCentral. All rights reserved.
 */
import { CrashGlobalConfig } from '../CrashGlobalConfig';
import { GlobalConfig } from 'sdk/module/config/GlobalConfig';
import { CRASH_KEYS } from '../constants';

jest.mock('sdk/module/config/GlobalConfig');
describe('CrashGlobalConfig', () => {
  describe('WHITE_SCREEN_TIMES', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });
    it('should get WHITE_SCREEN_TIMES', () => {
      GlobalConfig.get.mockReturnValue(1);
      expect(CrashGlobalConfig.getWhiteScreenTimes()).toEqual(1);
      expect(GlobalConfig.get).toHaveBeenCalledWith(
        CRASH_KEYS.WHITE_SCREEN_TIMES,
      );
    });
    it('should set WHITE_SCREEN_TIMES', () => {
      CrashGlobalConfig.setWhiteScreenTimes(2);
      expect(GlobalConfig.put).toHaveBeenCalledWith(
        CRASH_KEYS.WHITE_SCREEN_TIMES,
        2,
      );
    });
  });
  describe('LAST_HANDLE_WHITE_SCREEN_TIME', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });
    it('should get LAST_HANDLE_WHITE_SCREEN_TIME', () => {
      GlobalConfig.get.mockReturnValue(
        JSON.stringify({ count: 0, timeStamp: 0 }),
      );
      expect(CrashGlobalConfig.getLastWhiteScreenTime()).toEqual({
        count: 0,
        timeStamp: 0,
      });
      expect(GlobalConfig.get).toHaveBeenCalledWith(
        CRASH_KEYS.LAST_HANDLE_WHITE_SCREEN_TIME,
      );
    });
    it('should get LAST_HANDLE_WHITE_SCREEN_TIME', () => {
      GlobalConfig.get.mockReturnValue(undefined);
      expect(CrashGlobalConfig.getLastWhiteScreenTime()).toEqual({
        count: 0,
        timeStamp: 0,
      });
      expect(GlobalConfig.get).toHaveBeenCalledWith(
        CRASH_KEYS.LAST_HANDLE_WHITE_SCREEN_TIME,
      );
    });
    it('should set LAST_HANDLE_WHITE_SCREEN_TIME', () => {
      CrashGlobalConfig.setLastHandleWhiteScreenTime(2, 3);
      expect(GlobalConfig.put).toHaveBeenCalledWith(
        CRASH_KEYS.LAST_HANDLE_WHITE_SCREEN_TIME,
        JSON.stringify({
          count: 2,
          timeStamp: 3,
        }),
      );
    });
  });
});
