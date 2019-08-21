/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-28 22:02:53
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLogController } from '../CallLogController';
import { CallLogActionController } from '../CallLogActionController';
import { EntitySourceController } from 'sdk/framework/controller/impl/EntitySourceController';
import { CallLog } from '../../entity';
import { RCItemUserConfig } from 'sdk/module/RCItems/config';
import { AllCallLogFetchController } from '../AllCallLogFetchController';
import { MissedCallLogFetchController } from '../MissedCallLogFetchController';
import { CallLogBadgeController } from '../CallLogBadgeController';
import { CallLogUserConfig } from '../../config/CallLogUserConfig';
import { CallLogHandleDataController } from '../CallLogHandleDataController';
import { EntityNotificationController } from 'sdk/framework/controller/impl/EntityNotificationController';

jest.mock('../../../../config');
jest.mock('sdk/framework/controller/impl/EntitySourceController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('CallLogController', () => {
  let callLogController: CallLogController;
  let entitySourceController: EntitySourceController<CallLog, string>;
  let allConfig: CallLogUserConfig;
  let missedConfig: RCItemUserConfig;
  let notificationController: EntityNotificationController<CallLog>;

  function setUp() {
    entitySourceController = new EntitySourceController(
      null as any,
      null as any,
    );
    allConfig = new CallLogUserConfig('all');
    missedConfig = new RCItemUserConfig('missed');
    notificationController = new EntityNotificationController();
    callLogController = new CallLogController(
      entitySourceController,
      allConfig,
      missedConfig,
      notificationController,
    );
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('callLogActionController', () => {
    it('should return callLogActionController', () => {
      expect(callLogController.callLogActionController).toBeInstanceOf(
        CallLogActionController,
      );
    });
  });

  describe('allCallLogFetchController', () => {
    it('should return allCallLogFetchController', () => {
      expect(callLogController.allCallLogFetchController).toBeInstanceOf(
        AllCallLogFetchController,
      );
    });
  });

  describe('missedCallLogFetchController', () => {
    it('should return missedCallLogFetchController', () => {
      expect(callLogController.missedCallLogFetchController).toBeInstanceOf(
        MissedCallLogFetchController,
      );
    });
  });

  describe('callLogBadgeController', () => {
    it('should return callLogBadgeController', () => {
      expect(callLogController.callLogBadgeController).toBeInstanceOf(
        CallLogBadgeController,
      );
    });
  });

  describe('callLogHandleDataController', () => {
    it('should return callLogHandleDataController', () => {
      expect(callLogController.callLogHandleDataController).toBeInstanceOf(
        CallLogHandleDataController,
      );
    });
  });
});
