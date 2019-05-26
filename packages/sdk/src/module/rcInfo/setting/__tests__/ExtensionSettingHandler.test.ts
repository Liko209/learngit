/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */

import notificationCenter from '../../../../service/notificationCenter';
import { IRCInfoService } from '../../service/IRCInfoService';
import { SettingModuleIds } from '../../../setting/constants';
import {
  ESettingValueType,
  UserSettingEntity,
  SettingEntityIds,
} from '../../../setting';
import { ERCWebSettingUri } from '../../types';
import { ExtensionSettingHandler } from '../ExtensionSettingHandler';
import { RC_INFO } from 'sdk/service';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ExtensionSettingHandler', () => {
  let rcInfoService: IRCInfoService;
  let settingHandler: ExtensionSettingHandler;
  let mockDefaultSettingItem: UserSettingEntity;

  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    rcInfoService = {
      generateWebSettingUri: (type: any) => {},
      getCurrentCountry: () => {},
      getAreaCode: () => {},
      getCountryList: () => {},
      hasAreaCode: () => {},
    } as any;
    mockDefaultSettingItem = {
      id: SettingEntityIds.Phone_Extension,
      parentModelId: SettingModuleIds.PhoneSetting_General.id,
      valueGetter: expect.anything(),
      valueType: 3,
      weight: SettingModuleIds.ExtensionSetting.weight,
      state: 0,
    };
    settingHandler = new ExtensionSettingHandler(rcInfoService);
    settingHandler.notifyUserSettingEntityUpdate = jest.fn();
  }

  function cleanUp() {
    settingHandler.dispose();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  afterEach(() => {
    cleanUp();
  });

  describe('constructor', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    afterEach(() => {
      cleanUp();
    });
    it('should subscribe notification when create self', () => {
      expect(notificationCenter.on).toHaveBeenCalledWith(
        RC_INFO.CLIENT_INFO,
        expect.any(Function),
      );
    });
  });

  describe('handleUpdated', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });
    afterEach(() => {
      cleanUp();
    });
    it('should emit update when has cache && subscribe update', (done: jest.DoneCallback) => {
      settingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emitEntityUpdate(RC_INFO.CLIENT_INFO, [
        {
          id: 1,
        },
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).toBeCalled();
        expect(
          settingHandler.notifyUserSettingEntityUpdate,
        ).toHaveBeenCalledWith({});
        done();
      });
    });

    it('should not emit when has no cache', (done: jest.DoneCallback) => {
      settingHandler.getUserSettingEntity = jest.fn().mockResolvedValue({});

      notificationCenter.emitEntityUpdate(RC_INFO.CLIENT_INFO, [
        {
          id: 1,
        },
      ]);
      setTimeout(() => {
        expect(settingHandler.getUserSettingEntity).not.toBeCalled();
        expect(settingHandler.notifyUserSettingEntityUpdate).not.toBeCalled();
        done();
      });
    });
  });

  describe('getUserSettingEntity()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should return extension entity', async () => {
      rcInfoService.generateWebSettingUri = jest
        .fn()
        .mockResolvedValue('glip.com');
      const res = await settingHandler.getUserSettingEntity();
      expect(res).toEqual({
        id: SettingEntityIds.Phone_Extension,
        parentModelId: SettingModuleIds.PhoneSetting_General.id,
        valueGetter: expect.anything(),
        valueType: ESettingValueType.LINK,
        weight: SettingModuleIds.ExtensionSetting.weight,
        state: 0,
      });
      expect(res.valueGetter()).resolves.toEqual('glip.com');
      expect(rcInfoService.generateWebSettingUri).toBeCalledWith(
        ERCWebSettingUri.EXTENSION_URI,
      );
    });
  });

  describe('updateValue()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should do nothing', async () => {
      await settingHandler.updateValue({
        id: 111,
      } as any);
      expect(1).toEqual(1);
    });
  });
});
