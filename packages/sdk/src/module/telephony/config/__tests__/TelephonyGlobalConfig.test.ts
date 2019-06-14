/*
 * @Author: Paynter Chen
 * @Date: 2019-06-03 18:09:34
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfigService } from '../../../config';
import { TelephonyGlobalConfig } from '../TelephonyGlobalConfig';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { TELEPHONY_GLOBAL_KEYS } from '../configKeys';

jest.mock('../../../config/service/GlobalConfigService');
describe('TelephonyGlobalConfig', () => {
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }
  const mockConfigService = new GlobalConfigService();
  const USERID = '123';
  const MODULE = 'telephony';
  const KEY = 'test';
  const VALUE = 'abc';

  beforeEach(() => {
    clearMocks();

    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        return mockConfigService;
      });

    // TelephonyGlobalConfig = new TelephonyGlobalConfig();
  });

  describe('setCurrentMicrophone', () => {
    it('Should call user config to set last called number', () => {
      TelephonyGlobalConfig.setCurrentMicrophone('test');
      expect(mockConfigService.put).toHaveBeenCalledWith(
        MODULE,
        TELEPHONY_GLOBAL_KEYS.CURRENT_MICROPHONE,
        'test',
      );
    });
  });

  describe('getCurrentMicrophone', () => {
    it('Should call user config to get last called number', () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce(VALUE);
      const res = TelephonyGlobalConfig.getCurrentMicrophone();
      expect(res).toBe(VALUE);
    });
  });

  describe('setCurrentSpeaker', () => {
    it('Should call user config to set last called number', () => {
      TelephonyGlobalConfig.setCurrentSpeaker('test');
      expect(mockConfigService.put).toHaveBeenCalledWith(
        MODULE,
        TELEPHONY_GLOBAL_KEYS.CURRENT_SPEAKER,
        'test',
      );
    });
  });

  describe('getCurrentSpeaker', () => {
    it('Should call user config to get last called number', () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce(VALUE);
      const res = TelephonyGlobalConfig.getCurrentSpeaker();
      expect(res).toBe(VALUE);
    });
  });

  describe('setCurrentRinger', () => {
    it('Should call user config to set last called number', () => {
      TelephonyGlobalConfig.setCurrentRinger('test');
      expect(mockConfigService.put).toHaveBeenCalledWith(
        MODULE,
        TELEPHONY_GLOBAL_KEYS.CURRENT_RINGER,
        'test',
      );
    });
  });

  describe('getCurrentRinger', () => {
    it('Should call user config to get last called number', () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce(VALUE);
      const res = TelephonyGlobalConfig.getCurrentRinger();
      expect(res).toBe(VALUE);
    });
  });

  describe('setCurrentVolume', () => {
    it('Should call user config to set last called number', () => {
      TelephonyGlobalConfig.setCurrentVolume('test');
      expect(mockConfigService.put).toHaveBeenCalledWith(
        MODULE,
        TELEPHONY_GLOBAL_KEYS.CURRENT_VOLUME,
        'test',
      );
    });
  });

  describe('getCurrentVolume', () => {
    it('Should call user config to get last called number', () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce(VALUE);
      const res = TelephonyGlobalConfig.getCurrentVolume();
      expect(res).toBe(VALUE);
    });
  });

  describe('setUsedMicrophoneHistory', () => {
    it('Should call user config to set last called number', () => {
      TelephonyGlobalConfig.setUsedMicrophoneHistory('test');
      expect(mockConfigService.put).toHaveBeenCalledWith(
        MODULE,
        TELEPHONY_GLOBAL_KEYS.USED_MICROPHONE_HISTORY,
        'test',
      );
    });
  });

  describe('getUsedMicrophoneHistory', () => {
    it('Should call user config to get last called number', () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce(VALUE);
      const res = TelephonyGlobalConfig.getUsedMicrophoneHistory();
      expect(res).toBe(VALUE);
    });
  });

  describe('setUsedSpeakerHistory', () => {
    it('Should call user config to set last called number', () => {
      TelephonyGlobalConfig.setUsedSpeakerHistory('test');
      expect(mockConfigService.put).toHaveBeenCalledWith(
        MODULE,
        TELEPHONY_GLOBAL_KEYS.USED_SPEAKER_HISTORY,
        'test',
      );
    });
  });

  describe('getUsedSpeakerHistory', () => {
    it('Should call user config to get last called number', () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce(VALUE);
      const res = TelephonyGlobalConfig.getUsedSpeakerHistory();
      expect(res).toBe(VALUE);
    });
  });

  describe('setUsedRingerHistory', () => {
    it('Should call user config to set last called number', () => {
      TelephonyGlobalConfig.setUsedRingerHistory('test');
      expect(mockConfigService.put).toHaveBeenCalledWith(
        MODULE,
        TELEPHONY_GLOBAL_KEYS.USED_RINGER_HISTORY,
        'test',
      );
    });
  });

  describe('getUsedRingerHistory', () => {
    it('Should call user config to get last called number', () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce(VALUE);
      const res = TelephonyGlobalConfig.getUsedRingerHistory();
      expect(res).toBe(VALUE);
    });
  });
});
