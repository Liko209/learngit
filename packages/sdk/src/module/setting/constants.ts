/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-02 20:25:29
 * Copyright © RingCentral. All rights reserved.
 */

const SettingModuleIds = {
  GeneralSetting: { id: 101, weight: 101, idRange: [100, 199] },

  NotificationSetting: { id: 201, weight: 201, idRange: [200, 299] },

  MessageSetting: { id: 301, weight: 301, idRange: [300, 399] },

  PhoneSetting: { id: 401, weight: 401, idRange: [400, 499] },

  PhoneSetting_General: {
    id: 402,
    weight: 402,
  },

  CallerIdSetting: {
    id: 404,
    weight: 404,
  },

  RegionSetting: {
    id: 405,
    weight: 405,
  },
  ExtensionSetting: {
    id: 407,
    weight: 407,
  },

  PhoneSetting_AudioSource: {
    id: 440,
    weight: 440,
  },

  MeetingSetting: { id: 501, weight: 501, idRange: [500, 599] },

  CalendarSetting: { id: 601, weight: 601, idRange: [600, 699] },
};

export { SettingModuleIds };
