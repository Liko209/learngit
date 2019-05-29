/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-29 13:26:14
 * Copyright © RingCentral. All rights reserved.
 */

import { ForwardingNumberJsonData } from './ForwardingNumberJsonData';
import { RCInfoForwardingNumberController } from '../RCInfoForwardingNumberController';
import {
  EGetForwardingFlipNumberType,
  EForwardingFlipNumberType,
} from '../../types';
import notificationCenter from '../../../../service/notificationCenter';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { AccountUserConfig } from '../../../account/config/AccountUserConfig';
import { RCInfoUserConfig } from '../../config/RCInfoUserConfig';
describe('RCInfoForwardingNumberController', () => {
  let forwardingController;
  jest.spyOn(notificationCenter, 'emit');
  beforeEach(() => {
    forwardingController = new RCInfoForwardingNumberController();
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return { userConfig: AccountUserConfig.prototype };
        }
        if (config === ServiceConfig.RC_INFO_SERVICE) {
          return { DBConfig: RCInfoUserConfig.prototype };
        }
        return;
      });
  });

  describe('getForwardingFlipNumbers', () => {
    it('should return empty if there is not data', async () => {
      forwardingController[
        'rcInfoUserConfig'
      ].getForwardingNumbers = jest.fn().mockResolvedValue(undefined);
      forwardingController[
        'requestForwardingNumbers'
      ] = jest.fn().mockResolvedValueOnce({});
      const result = await forwardingController.getForwardingFlipNumbers(
        EGetForwardingFlipNumberType.FLIP,
      );
      expect(result.length).toEqual(0);
    });
    it('should return correct forwarding numbers', async () => {
      forwardingController[
        'rcInfoUserConfig'
      ].getForwardingNumbers = jest
        .fn()
        .mockResolvedValue(ForwardingNumberJsonData);
      forwardingController[
        'requestForwardingNumbers'
      ] = jest.fn().mockResolvedValueOnce({});
      const result = await forwardingController.getForwardingFlipNumbers(
        EGetForwardingFlipNumberType.FORWARDING,
      );
      expect(result.map(item => item.phoneNumber)).toEqual([
        '+16502095678',
        '+16502096235',
      ]);
      expect(result[1].type).toEqual(EForwardingFlipNumberType.WORK);
      expect(result[1].flipNumber).toEqual(3);
    });
    it('should return correct flip numbers', async () => {
      forwardingController[
        'rcInfoUserConfig'
      ].getForwardingNumbers = jest
        .fn()
        .mockResolvedValue(ForwardingNumberJsonData);
      forwardingController[
        'requestForwardingNumbers'
      ] = jest.fn().mockResolvedValueOnce({});
      const result = await forwardingController.getForwardingFlipNumbers(
        EGetForwardingFlipNumberType.FLIP,
      );
      expect(result.map(item => item.phoneNumber)).toEqual([
        '+16502095678',
        '+16502090011',
      ]);
      expect(result[1].type).toEqual(EForwardingFlipNumberType.HOME);
      expect(result[1].flipNumber).toEqual(2);
    });
  });
});
