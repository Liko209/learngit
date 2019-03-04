/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-04 14:59:52
 * Copyright © RingCentral. All rights reserved.
 */

import { MakeCallController } from '../MakeCallController';
import { GlobalConfigService } from '../../../../module/config';
import { MAKE_CALL_ERROR_CODE, E911_STATUS } from '../../types';

jest.mock('../../../../module/config');
GlobalConfigService.getInstance = jest.fn();

describe('MakeCallController', () => {
  let makeCallController: MakeCallController;
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  beforeEach(() => {
    clearMocks();
    makeCallController = new MakeCallController();
  });
  it('should return error when there is no internet connection', () => {
    jest
      .spyOn(makeCallController, '_checkInternetConnection')
      .mockReturnValue(MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION);
    expect(makeCallController.tryMakeCall('123')).toBe(
      MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION,
    );
  });

  it('should return error when users have no voip calling permission ', () => {
    const extInfo = {
      serviceFeatures: [{ featureName: 'VoipCalling', enabled: false }],
    };
    const mockRcInfo = {
      getExtensionInfo: jest.fn().mockReturnValue(extInfo),
    };
    jest
      .spyOn(makeCallController, '_checkVoipStatusAndCallSetting')
      .mockReturnValue(MAKE_CALL_ERROR_CODE.THE_COUNTRY_BLOCKED_VOIP);

    jest
      .spyOn(makeCallController, '_getRcE911Status')
      .mockReturnValue(E911_STATUS.DISCLINED);

    Object.assign(makeCallController, {
      _rcInfo: mockRcInfo,
    });
    const result = makeCallController.tryMakeCall('102');
    expect(result).toBe(MAKE_CALL_ERROR_CODE.THE_COUNTRY_BLOCKED_VOIP);
  });

  it('should return error when E911 is declined ', () => {
    // jest
    //   .spyOn(makeCallController, '_isRcFeaturePermissionEnabled')
    //   .mockReturnValue(true);
    // jest
    //   .spyOn(makeCallController, '_getRcE911Status')
    //   .mockReturnValue(E911_STATUS.DISCLINED);
    // jest
    //   .spyOn(makeCallController, 'isRcFeaturePermissionEnabled')
    //   .mockReturnValue(false);
    // makeCallController.isRcFeaturePermissionEnabled = jest
    //   .fn()
    //   .mockReturnValue(false);
    // const result = makeCallController.tryMakeCall('102');
    // expect(result).toBe(MAKE_CALL_ERROR_CODE.E911_ACCEPT_REQUIRED);
  });

  it('should return error when N11 is declined with N11 101', () => {
    const specialNumberRule = {
      records: [
        {
          description: 'Public Information/Referral',
          features: {
            sms: {
              enabled: false,
              reason: {
                id: 'N11-103',
                message: 'Message to this service is unavailable',
              },
            },
            voip: {
              enabled: false,
              reason: {
                id: 'N11-101',
                message: 'Call to this service is unavailable',
              },
            },
          },
          phoneNumber: '211',
        },
        {
          description: 'Weather & Travel Information',
          features: {
            sms: {
              enabled: false,
              reason: {
                id: 'N11-103',
                message: 'Message to this service is unavailable',
              },
            },
            voip: {
              enabled: false,
              reason: {
                id: 'N11-101',
                message: 'Call to this service is unavailable',
              },
            },
          },
          phoneNumber: '511',
        },
      ],
    };
    const mockRcInfo = {
      getExtensionInfo: jest.fn(),
      getSpecialNumberRule: jest.fn().mockReturnValue(specialNumberRule),
    };
    Object.assign(makeCallController, {
      _rcInfo: mockRcInfo,
    });
    const result = makeCallController.tryMakeCall('211');
    expect(result).toBe(MAKE_CALL_ERROR_CODE.N11_101);
  });

  it('should return error when N11 is declined with N11 102', () => {
    const specialNumberRule = {
      records: [
        {
          description: 'Public Information/Referral',
          features: {
            sms: {
              enabled: false,
              reason: {
                id: 'N11-103',
                message: 'Message to this service is unavailable',
              },
            },
            voip: {
              enabled: false,
              reason: {
                id: 'N11-101',
                message: 'Call to this service is unavailable',
              },
            },
          },
          phoneNumber: '211',
        },
        {
          description: 'Weather & Travel Information',
          features: {
            sms: {
              enabled: false,
              reason: {
                id: 'N11-103',
                message: 'Message to this service is unavailable',
              },
            },
            voip: {
              enabled: false,
              reason: {
                id: 'N11-102',
                message: 'Call to this service is unavailable',
              },
            },
          },
          phoneNumber: '511',
        },
      ],
    };
    const mockRcInfo = {
      getExtensionInfo: jest.fn(),
      getSpecialNumberRule: jest.fn().mockReturnValue(specialNumberRule),
    };
    Object.assign(makeCallController, {
      _rcInfo: mockRcInfo,
    });
    const result = makeCallController.tryMakeCall('511');
    expect(result).toBe(MAKE_CALL_ERROR_CODE.N11_102);
  });

  it('should return error when N11 is declined with N11 102', () => {
    const specialNumberRule = {
      records: [
        {
          description: 'Public Information/Referral',
          features: {
            sms: {
              enabled: false,
              reason: {
                id: 'N11-103',
                message: 'Message to this service is unavailable',
              },
            },
            voip: {
              enabled: false,
              reason: {
                id: 'N11-101',
                message: 'Call to this service is unavailable',
              },
            },
          },
          phoneNumber: '211',
        },
        {
          description: 'Weather & Travel Information',
          features: {
            sms: {
              enabled: false,
              reason: {
                id: 'N11-103',
                message: 'Message to this service is unavailable',
              },
            },
            voip: {
              enabled: false,
              reason: {
                id: 'N11-103',
                message: 'Call to this service is unavailable',
              },
            },
          },
          phoneNumber: '511',
        },
      ],
    };
    const mockRcInfo = {
      getExtensionInfo: jest.fn(),
      getSpecialNumberRule: jest.fn().mockReturnValue(specialNumberRule),
    };
    Object.assign(makeCallController, {
      _rcInfo: mockRcInfo,
    });
    const result = makeCallController.tryMakeCall('511');
    expect(result).toBe(MAKE_CALL_ERROR_CODE.N11_OTHERS);
  });

  it('should return error when ', () => {});
  it('should return error when ', () => {});
  it('should return error when ', () => {});
  it('should return error when ', () => {});
  it('should return error when ', () => {});
});
