/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-09 20:05:55
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileSetting } from '../PhoneSetting';
import { SettingEntityIds } from 'sdk/module/setting';
import { CallerIdSettingHandler } from '../handlers/MicrophoneSourceSettingHandler';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ProfileSetting ', () => {
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
      const profileSetting = new ProfileSetting({} as any);
      const handlerMap = profileSetting.getHandlerMap();
      expect(handlerMap[SettingEntityIds.Phone_CallerId]).toBeInstanceOf(
        CallerIdSettingHandler,
      );
    });
  });
});
