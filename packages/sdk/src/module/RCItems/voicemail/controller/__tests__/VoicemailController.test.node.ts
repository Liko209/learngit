/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-27 20:19:50
 * Copyright © RingCentral. All rights reserved.
 */

import { VoicemailController } from '../VoicemailController';
import { VoicemailActionController } from '../VoicemailActionController';
import { EntitySourceController } from 'sdk/framework/controller/impl/EntitySourceController';
import { VoicemailBadgeController } from '../VoicemailBadgeController';
import { VoicemailHandleDataController } from '../VoicemailHandleDataController';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('VoicemailController', () => {
  let voicemailController: VoicemailController;
  let entitySourceController: EntitySourceController<any>;
  function setUp() {
    entitySourceController = new EntitySourceController(
      null as any,
      null as any,
    );
    voicemailController = new VoicemailController(entitySourceController);
  }
  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('voicemailActionController', () => {
    it('should return voicemailActionController', () => {
      expect(voicemailController.voicemailActionController).toBeInstanceOf(
        VoicemailActionController,
      );
    });
  });

  describe('voicemailBadgeController', () => {
    it('should return voicemailBadgeController', () => {
      expect(voicemailController.voicemailBadgeController).toBeInstanceOf(
        VoicemailBadgeController,
      );
    });
  });

  describe('voicemailHandleDataController', () => {
    it('should return voicemailHandleDataController', () => {
      expect(voicemailController.voicemailHandleDataController).toBeInstanceOf(
        VoicemailHandleDataController,
      );
    });
  });
});
