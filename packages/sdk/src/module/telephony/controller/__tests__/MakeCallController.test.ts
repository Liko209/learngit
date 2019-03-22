/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-04 14:59:52
 * Copyright © RingCentral. All rights reserved.
 */

import { MakeCallController } from '../MakeCallController';
import { GlobalConfigService } from '../../../../module/config';
import { MAKE_CALL_ERROR_CODE, E911_STATUS } from '../../types';
import { PhoneParserUtility } from '../../../../utils/phoneParser';
import { PersonService } from '../../../person';
import { RcInfoService } from '../../../rcInfo/service';

jest.mock('../../../../module/config');
jest.mock('../../../../utils/phoneParser');
jest.mock('../../../person');
jest.mock('../../../rcInfo/service');

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
  it('should return error when there is no internet connection', async () => {
    jest
      .spyOn(makeCallController, '_checkInternetConnection')
      .mockReturnValue(MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION);
    const result = await makeCallController.tryMakeCall('123');
    expect(result).toBe(MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION);
  });

  it('should return error when users have no voip calling permission ', async () => {
    const extInfo = {
      serviceFeatures: [{ featureName: 'VoipCalling', enabled: false }],
    };

    RcInfoService.getInstance = jest.fn().mockReturnValue({
      getRcExtensionInfo: jest.fn().mockReturnValue(extInfo),
    });
    jest
      .spyOn(makeCallController, '_checkVoipStatusAndCallSetting')
      .mockReturnValue(MAKE_CALL_ERROR_CODE.THE_COUNTRY_BLOCKED_VOIP);

    jest
      .spyOn(makeCallController, '_getRcE911Status')
      .mockReturnValue(E911_STATUS.DISCLINED);

    const result = await makeCallController.tryMakeCall('102');
    expect(result).toBe(MAKE_CALL_ERROR_CODE.THE_COUNTRY_BLOCKED_VOIP);
  });

  it('should return error when N11 is declined with N11 101', async () => {
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
    RcInfoService.getInstance = jest.fn().mockReturnValue({
      getRcExtensionInfo: jest.fn(),
      getSpecialNumberRule: jest.fn().mockReturnValue(specialNumberRule),
    });
    const result = await makeCallController.tryMakeCall('211');
    expect(result).toBe(MAKE_CALL_ERROR_CODE.N11_101);
  });

  it('should return error when N11 is declined with N11 102', async () => {
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
    RcInfoService.getInstance = jest.fn().mockReturnValue({
      getRcExtensionInfo: jest.fn(),
      getSpecialNumberRule: jest.fn().mockReturnValue(specialNumberRule),
    });
    const result = await makeCallController.tryMakeCall('511');
    expect(result).toBe(MAKE_CALL_ERROR_CODE.N11_102);
  });

  it('should return error when N11 is declined with N11 102', async () => {
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
    RcInfoService.getInstance = jest.fn().mockReturnValue({
      getRcExtensionInfo: jest.fn(),
      getSpecialNumberRule: jest.fn().mockReturnValue(specialNumberRule),
    });
    const result = await makeCallController.tryMakeCall('511');
    expect(result).toBe(MAKE_CALL_ERROR_CODE.N11_OTHERS);
  });

  it('should return error when users try to make an international call without permission ', async () => {
    const extInfo = {
      serviceFeatures: [
        { featureName: 'VoipCalling', enabled: false },
        { featureName: 'InternationalCalling', enabled: false },
      ],
    };
    RcInfoService.getInstance = jest.fn().mockReturnValue({
      getRcExtensionInfo: jest.fn().mockReturnValue(extInfo),
      getSpecialNumberRule: jest.fn(),
    });

    PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
      isInternationalDialing: jest.fn().mockReturnValue(true),
      getE164: jest.fn(),
      isShortNumber: jest.fn(),
    });
    const result = await makeCallController.tryMakeCall('+8618950150021');
    expect(result).toBe(MAKE_CALL_ERROR_CODE.NO_INTERNATIONAL_CALLS_PERMISSION);
  });

  it('should return error when contact is not matched ', async () => {
    PhoneParserUtility.getPhoneParser = jest.fn().mockReturnValue({
      isInternationalDialing: jest.fn().mockReturnValue(true),
      getE164: jest.fn(),
      isShortNumber: jest.fn().mockReturnValue(true),
    });

    PersonService.getInstance = jest.fn().mockReturnValue({
      matchContactByPhoneNumber: jest.fn().mockReturnValue(null),
    });
    const result = await makeCallController.tryMakeCall('213');
    expect(result).toBe(MAKE_CALL_ERROR_CODE.INVALID_EXTENSION_NUMBER);
  });
});
