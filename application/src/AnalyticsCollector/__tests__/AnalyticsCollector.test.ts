/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-08 15:28:48
 * Copyright © RingCentral. All rights reserved.
 */

import { analyticsCollector } from '../index';
import { dataAnalysis } from 'sdk';
import { ENTITY_NAME } from '@/store/constants';
import * as utils from '@/store/utils';
jest.mock('@/store/utils');
jest.mock('sdk');

describe('analyticsCollector', () => {
  describe('makeOutboundCall', () => {
    it('should call track with correct parameters', () => {
      analyticsCollector.makeOutboundCall('profile');
      expect(dataAnalysis.track).toHaveBeenCalledWith(
        'Jup_Web/DT_phone_outboundCall',
        {
          source: 'profile',
          type: 'call',
        },
      );
    });
  });
  describe('sendPost', () => {
    it('should call track with correct parameters', () => {
      analyticsCollector.sendPost('input box', 'text', 'team');
      expect(dataAnalysis.track).toHaveBeenCalledWith(
        'Jup_Web/DT_msg_postSent',
        {
          source: 'input box',
          postType: 'text',
          destination: 'team',
        },
      );
    });
  });
  describe('identify', () => {
    function setUp(person: any, company: any, userId: number) {
      const mockedReturnData = {
        [ENTITY_NAME.PERSON]: person,
        [ENTITY_NAME.COMPANY]: company,
      };
      jest
        .spyOn(utils, 'getEntity')
        .mockImplementation(
          (entityName: ENTITY_NAME) => mockedReturnData[entityName],
        );
      jest.spyOn(utils, 'getGlobalValue').mockReturnValue(userId);
    }
    it('identify should call with correct value', () => {
      setUp(
        {
          email: 99,
          companyId: 1,
          inviterId: 2,
          displayName: 'Jupiter',
        },
        {
          name: 1,
          rcAccountId: 2,
        },
        100,
      );
      analyticsCollector.identify();
      expect(dataAnalysis.identify).toBeCalledWith(100, {
        accountType: 'rc',
        companyId: 1,
        companyName: 1,
        name: 'Jupiter',
        email: 99,
        id: 100,
        rcAccountId: 2,
        signupType: 'viral',
      });
    });
    it('identify should not be called due to invalid data', () => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      setUp({ email: '' }, {}, 10);
      expect(dataAnalysis.identify).not.toHaveBeenCalled();

      setUp({ email: '' }, {}, 0);
      expect(dataAnalysis.identify).not.toHaveBeenCalled();

      setUp({ email: 'good' }, {}, 0);
      expect(dataAnalysis.identify).not.toHaveBeenCalled();

      setUp({ email: 'good' }, { name: 'RC' }, 0);
      expect(dataAnalysis.identify).not.toHaveBeenCalled();
    });
  });
});
