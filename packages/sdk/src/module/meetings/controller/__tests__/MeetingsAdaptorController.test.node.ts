/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-07 13:45:42
 * Copyright © RingCentral. All rights reserved.
 */
import { MeetingsAdaptorController } from '../MeetingsAdaptorController';
import { AccountService, isInBeta } from 'sdk/module/account';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ProfileService, VIDEO_SERVICE_OPTIONS } from 'sdk/module/profile';
import { AccountUserConfig } from 'sdk/module/account/config/AccountUserConfig';
import { ACCOUNT_TYPE_ENUM } from 'sdk/authenticator/constants';
import { MEETING_SERVICE_TYPE } from '../../types';
import _ from 'lodash';

jest.mock('sdk/module/account');
jest.mock('sdk/module/profile');

describe('MeetingsAdaptorController', () => {
  let profileService: ProfileService;

  function setUp() {
    profileService = new ProfileService();

    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return {
            userConfig: AccountUserConfig.prototype,
          };
        }
        if (config === ServiceConfig.PROFILE_SERVICE) {
          return profileService;
        }
      });
  }

  describe('getMeetingServiceType', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });

    function innerSetup(
      accountType: any,
      inBeta: boolean,
      firstVS: boolean,
      secondVS: boolean,
    ) {
      const userConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).userConfig;
      jest.spyOn(userConfig, 'getAccountType').mockReturnValue(accountType);
      isInBeta.mockReturnValueOnce(inBeta);
      profileService.isVideoServiceEnabled = jest
        .fn()
        .mockImplementation((key: string) => {
          if (key === VIDEO_SERVICE_OPTIONS.RINGCENTRAL_VIDEO) {
            return firstVS;
          }
          if (key === VIDEO_SERVICE_OPTIONS.RINGCENTRAL_VIDEO_EMBEDDED) {
            return secondVS;
          }
        });

      const controller = new MeetingsAdaptorController();
      return controller;
    }
    it('should return RCV when user is RC account, and in RCV beta and has RCV service - deep link', async () => {
      setUp();
      const controller = innerSetup(ACCOUNT_TYPE_ENUM.RC, true, true, false);

      expect(await controller.getMeetingServiceType()).toEqual(
        MEETING_SERVICE_TYPE.RCV,
      );
    });
    it('should return RCV when user is RC account, and in RCV beta and has RCV service - embedded', async () => {
      setUp();
      const controller = innerSetup(ACCOUNT_TYPE_ENUM.RC, true, false, true);

      expect(await controller.getMeetingServiceType()).toEqual(
        MEETING_SERVICE_TYPE.RCV,
      );
    });
    it('should return ZOOM when user is not RC account', async () => {
      setUp();
      const controller = innerSetup(ACCOUNT_TYPE_ENUM.GLIP, true, false, true);

      expect(await controller.getMeetingServiceType()).toEqual(
        MEETING_SERVICE_TYPE.ZOOM,
      );
    });
    it('should return ZOOM when user is RC account but not in RCV beta', async () => {
      setUp();
      const controller = innerSetup(ACCOUNT_TYPE_ENUM.RC, false, true, true);

      expect(await controller.getMeetingServiceType()).toEqual(
        MEETING_SERVICE_TYPE.ZOOM,
      );
    });
    it('should return ZOOM when user is RC account and in RCV beta but has not RCV service, neither deep link nor embedded', async () => {
      setUp();
      const controller = innerSetup(ACCOUNT_TYPE_ENUM.RC, true, false, false);

      expect(await controller.getMeetingServiceType()).toEqual(
        MEETING_SERVICE_TYPE.ZOOM,
      );
    });
  });
  describe('startMeeting', () => {
    function innerSetup(meetingType: MEETING_SERVICE_TYPE) {
      const controller = new MeetingsAdaptorController();
      Object.assign(controller, {
        _meetingController: {
          startMeeting: jest.fn(),
          isRCVideo: jest
            .fn()
            .mockReturnValue(MEETING_SERVICE_TYPE.RCV === meetingType),
        },
      });
      jest
        .spyOn(controller, 'getMeetingServiceType')
        .mockResolvedValueOnce(meetingType);
      return controller;
    }
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should call rcv startMeeting', async () => {
      const controller = innerSetup(MEETING_SERVICE_TYPE.RCV);
      await controller.startMeeting([]);
      expect(controller['_meetingController'].startMeeting).toHaveBeenCalled();
      expect(controller['_meetingController'].isRCVideo()).toBeTruthy();
    });
    it('should call zoom startMeeting', async () => {
      const controller = innerSetup(MEETING_SERVICE_TYPE.ZOOM);
      await controller.startMeeting([]);
      expect(controller['_meetingController'].startMeeting).toHaveBeenCalled();
      expect(controller['_meetingController'].isRCVideo()).toBeFalsy();
    });
  });
});
