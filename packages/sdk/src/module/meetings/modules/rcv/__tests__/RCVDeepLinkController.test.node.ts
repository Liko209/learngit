/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-07 15:05:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AuthUserConfig } from 'sdk/module/account/config/AuthUserConfig';
import { AccountService } from 'sdk/module/account';
import { Api } from 'sdk/api';
import { RCVDeepLinkController } from '../RCVDeepLinkController';
import { MEETING_ACTION } from '../../../types';
import ItemAPI from 'sdk/api/glip/item';

jest.mock('sdk/module/account');
jest.mock('sdk/api');
jest.mock('sdk/api/glip/item');

describe('RCVDeepLinkController', () => {
  function setUp(tk: any, glipServer: any) {
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return {
            authUserConfig: AuthUserConfig.prototype,
          };
        }
      });
    const authUserConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).authUserConfig;
    jest.spyOn(authUserConfig, 'getGlipToken').mockReturnValue(tk);

    Object.defineProperty(Api, 'httpConfig', {
      get: () => {
        return {
          glip: { server: glipServer },
        };
      },
      configurable: true,
    });
    const controller = new RCVDeepLinkController();
    return controller;
  }
  describe('startMeeting', () => {


    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });
    it('should return link to start rcv when has group id, base url, glip token', async () => {
      const controller = setUp('url', 'tk');
      const result = await controller.startMeeting([1]);
      expect(result.action).toEqual(MEETING_ACTION.DEEP_LINK);
    });
    it('should return link to start rcv when has not group id', async () => {
      const controller = setUp('url', 'tk');
      const result = await controller.startMeeting([]);
      expect(result.action).toEqual(MEETING_ACTION.ERROR);
    });
    it('should return link to start rcv when has not base url', async () => {
      const controller = setUp(undefined, 'tk');
      const result = await controller.startMeeting([]);
      expect(result.action).toEqual(MEETING_ACTION.ERROR);
    });
    it('should return link to start rcv when has not glip token', async () => {
      const controller = setUp('url', undefined);
      const result = await controller.startMeeting([]);
      expect(result.action).toEqual(MEETING_ACTION.ERROR);
    });
  });
  describe('cancelMeeting', () => {
    it('cancelMeeting', async () => {
      ItemAPI.cancelRCV.mockResolvedValueOnce('');
      const controller = new RCVDeepLinkController();
      await controller.cancelMeeting(1);
      expect(ItemAPI.cancelRCV).toHaveBeenCalled();
    });
  });
  describe('getJoinUrl', () => {
    it('cancelMeeting', async () => {

      const controller = setUp('tk', 'https://app.glip.com');
      const a = await controller.getJoinUrl(1)
      expect(a).toEqual('https://app.glip.com/api/rcv/join-call/waiting-page?meeting_item_id=1&tk=tk')
    });
  });
});
