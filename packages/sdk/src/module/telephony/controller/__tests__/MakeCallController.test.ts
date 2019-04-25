/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-04 14:59:52
 * Copyright © RingCentral. All rights reserved.
 */

import { MakeCallController } from '../MakeCallController';
import { MAKE_CALL_ERROR_CODE, E911_STATUS } from '../../types';
import { PhoneParserUtility } from '../../../../utils/phoneParser';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';

jest.mock('../../../../module/config');
jest.mock('../../../../utils/phoneParser');
jest.mock('../../../person');
jest.mock('../../../rcInfo/service');

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
      serviceFeatures: [{ featureName: 'VoipCalling', enabled: true }],
    };

    ServiceLoader.getInstance = jest.fn().mockReturnValue({
      getRCExtensionInfo: jest.fn().mockReturnValue(extInfo),
      getSpecialNumberRule: jest.fn(),
    });
    const spy = jest.spyOn(makeCallController, '_checkVoipN11Number');

    jest
      .spyOn(makeCallController, '_getRCE911Status')
      .mockReturnValue(E911_STATUS.DISCLINED);

    const result = await makeCallController.tryMakeCall('102');
    expect(spy).not.toBeCalled();
    expect(result).toBe(MAKE_CALL_ERROR_CODE.E911_ACCEPT_REQUIRED);
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
    ServiceLoader.getInstance = jest.fn().mockReturnValue({
      getRCExtensionInfo: jest.fn(),
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
    ServiceLoader.getInstance = jest.fn().mockReturnValue({
      getRCExtensionInfo: jest.fn(),
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
    ServiceLoader.getInstance = jest.fn().mockReturnValue({
      getRCExtensionInfo: jest.fn(),
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
    ServiceLoader.getInstance = jest.fn().mockReturnValue({
      getRCExtensionInfo: jest.fn().mockReturnValue(extInfo),
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

    const extInfo = {
      serviceFeatures: [
        { featureName: 'VoipCalling', enabled: false },
        { featureName: 'InternationalCalling', enabled: false },
      ],
    };
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((serviceName: string) => {
        if (serviceName === ServiceConfig.PERSON_SERVICE) {
          return {
            matchContactByPhoneNumber: jest.fn().mockReturnValue(null),
          };
        }
        return {
          getRCExtensionInfo: jest.fn().mockReturnValue(extInfo),
          getSpecialNumberRule: jest.fn(),
        };
      });

    const result = await makeCallController.tryMakeCall('213');
    expect(result).toBe(MAKE_CALL_ERROR_CODE.INVALID_EXTENSION_NUMBER);
  });
});
