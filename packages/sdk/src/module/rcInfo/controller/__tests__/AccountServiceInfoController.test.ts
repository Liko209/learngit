/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-30 14:04:42
 * Copyright © RingCentral. All rights reserved.
 */

import { AccountServiceInfoController } from '../AccountServiceInfoController';
import { RCInfoFetchController } from '../RCInfoFetchController';

jest.mock('../RCInfoFetchController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('AccountServiceInfoController', () => {
  let accountServiceInfoController: AccountServiceInfoController;
  let rcInfoFetchController: RCInfoFetchController;

  const invalidServiceInfo = { limits: {} };
  const serviceInfo = {
    limits: {
      cloudRecordingStorage: 0,
      freeSoftPhoneLinesPerExtension: 1,
      maxExtensionNumberLength: 7,
      maxMonitoredExtensionsPerUser: 100,
      meetingSize: 4,
      shortExtensionNumberLength: 4,
      siteCodeLength: 3,
    },
  };

  function setUp() {
    rcInfoFetchController = new RCInfoFetchController();
    accountServiceInfoController = new AccountServiceInfoController(
      rcInfoFetchController,
    );
  }

  beforeEach(() => {
    clearMocks();
  });

  describe('getMaxExtensionNumberLength', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return max ext length when has max ext len in service info', async () => {
      rcInfoFetchController.getAccountServiceInfo = jest
        .fn()
        .mockResolvedValue(serviceInfo);
      const res = await accountServiceInfoController.getMaxExtensionNumberLength();
      expect(res).toEqual(7);
    });

    it('should return default ext length when has no max ext len in service info', async () => {
      rcInfoFetchController.getAccountServiceInfo = jest
        .fn()
        .mockResolvedValue(invalidServiceInfo);
      const res = await accountServiceInfoController.getMaxExtensionNumberLength();
      expect(res).toEqual(5);
    });
  });

  describe('getShortExtensionNumberLength', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return min ext length when has min ext len in service info', async () => {
      rcInfoFetchController.getAccountServiceInfo = jest
        .fn()
        .mockResolvedValue(serviceInfo);
      const res = await accountServiceInfoController.getShortExtensionNumberLength();
      expect(res).toEqual(4);
    });

    it('should return default ext length when has no min ext len in service info', async () => {
      rcInfoFetchController.getAccountServiceInfo = jest
        .fn()
        .mockResolvedValue(invalidServiceInfo);
      const res = await accountServiceInfoController.getShortExtensionNumberLength();
      expect(res).toEqual(0);
    });
  });
});
