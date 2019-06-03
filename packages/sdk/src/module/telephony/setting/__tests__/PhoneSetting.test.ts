/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-09 20:05:55
 * Copyright © RingCentral. All rights reserved.
 */

import { PhoneSetting } from '../PhoneSetting';
import { SettingEntityIds } from 'sdk/module/setting';
import { MicrophoneSourceSettingHandler } from '../handlers/MicrophoneSourceSettingHandler';
import { SpeakerSourceSettingHandler, VolumeSettingHandler } from '../handlers';
import { TelephonyGlobalConfig } from '../../config/TelephonyGlobalConfig';

jest.mock('sdk/module/telephony/config/TelephonyGlobalConfig');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PhoneSetting ', () => {
  function setUp() {}

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('handlerMap', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return handlerMap correctly', async () => {
      const phoneSetting = new PhoneSetting();
      const handlerMap = phoneSetting.getHandlerMap();
      expect(
        handlerMap[SettingEntityIds.Phone_MicrophoneSource],
      ).toBeInstanceOf(MicrophoneSourceSettingHandler);
      expect(handlerMap[SettingEntityIds.Phone_SpeakerSource]).toBeInstanceOf(
        SpeakerSourceSettingHandler,
      );
      expect(handlerMap[SettingEntityIds.Phone_Volume]).toBeInstanceOf(
        VolumeSettingHandler,
      );
    });
  });
});
