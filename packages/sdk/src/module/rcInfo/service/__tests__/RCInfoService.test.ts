/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-13 13:33:37
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoService } from '../RCInfoService';
import { RCInfoController } from '../../controller/RCInfoController';

jest.mock('../../controller/RCInfoController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RCInfoService', () => {
  let rcInfoService: RCInfoService;
  let rcInfoController: RCInfoController;

  function setUp() {
    rcInfoService = new RCInfoService();
    rcInfoController = new RCInfoController();
    rcInfoService['_rcInfoController'] = rcInfoController;
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('loadRegionInfo', () => {
    const regionInfoController = {
      loadRegionInfo: jest.fn(),
    };

    beforeEach(() => {
      clearMocks();
      setUp();

      rcInfoController.getRegionInfoController = jest
        .fn()
        .mockReturnValue(regionInfoController);
    });

    it('should call load region info when has voip permission', async () => {
      rcInfoService.isVoipCallingAvailable = jest.fn().mockResolvedValue(true);
      await rcInfoService.loadRegionInfo();
      expect(regionInfoController.loadRegionInfo).toHaveBeenCalled();
      expect(rcInfoService.isVoipCallingAvailable).toHaveBeenCalled();
    });

    it('should not call load region info when does not have voip permission', async () => {
      rcInfoService.isVoipCallingAvailable = jest.fn().mockResolvedValue(false);
      await rcInfoService.loadRegionInfo();
      expect(regionInfoController.loadRegionInfo).not.toHaveBeenCalled();
      expect(rcInfoService.isVoipCallingAvailable).toHaveBeenCalled();
    });
  });
});
