/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-30 22:08:55
 * Copyright © RingCentral. All rights reserved.
 */

import { RCEventSubscriptionService } from '../RCEventSubscriptionService';
import { RCEventSubscriptionConfig } from '../../config';
import { RCSubscriptionController } from '../../controller';

jest.mock('../../config', () => {
  const xx = {} as RCEventSubscriptionConfig;
  return {
    RCEventSubscriptionConfig: () => {
      return xx;
    },
  };
});

jest.mock('../../controller', () => {
  const xx = {
    removeEventListener: jest.fn(),
    addEventListener: jest.fn(),
    stopSubscription: jest.fn(),
    startSubscription: jest.fn(),
  };
  return {
    RCSubscriptionController: () => {
      return xx;
    },
  };
});

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('RCEventSubscriptionService', () => {
  let rcEventSubscriptionConfig: RCEventSubscriptionConfig;
  let rcEventSubscriptionService: RCEventSubscriptionService;
  let rcSubscriptionController: RCSubscriptionController;
  function setUp() {
    rcEventSubscriptionConfig = new RCEventSubscriptionConfig();
    rcSubscriptionController = new RCSubscriptionController(
      rcEventSubscriptionConfig,
    );
    rcEventSubscriptionService = new RCEventSubscriptionService();
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('userConfig', () => {
    it('should return user config', () => {
      expect(rcEventSubscriptionService.userConfig).toEqual({});
    });
  });

  describe('onStart', () => {
    it('should start subscription when service start', () => {
      rcEventSubscriptionService['onStarted']();
      expect(rcSubscriptionController.startSubscription).toBeCalled();
    });
  });
});
