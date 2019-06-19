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

  it('should return error when dialing out N11 numbers', async () => {
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
    expect(result).toBe(MAKE_CALL_ERROR_CODE.N11_OTHERS);
  });
});
