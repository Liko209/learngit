/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-09 17:40:47
 * Copyright © RingCentral. All rights reserved.
 */

import { buildEntityNotificationController } from '../index';
import { EntityNotificationController } from '../impl/EntityNotificationController';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('build controller', () => {
  beforeEach(() => {
    clearMocks();
  });

  describe('buildEntityNotificationController', () => {
    it('buildEntityNotificationController', () => {
      const controller = buildEntityNotificationController();
      expect(controller).toBeInstanceOf(EntityNotificationController);
    });
  });
});
