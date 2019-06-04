/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-27 17:41:04
 * Copyright © RingCentral. All rights reserved.
 */

import { VoicemailActionController } from '../VoicemailActionController';
import { EntitySourceController } from 'sdk/framework/controller/impl/EntitySourceController';
import { PartialModifyController } from 'sdk/framework/controller/impl/PartialModifyController';
import { Voicemail } from '../../entity';

jest.mock('sdk/api/ringcentral/RCItemApi');
jest.mock('sdk/framework/controller/impl/EntitySourceController');
jest.mock('sdk/framework/controller/impl/PartialModifyController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('VoicemailActionController', () => {
  let voicemailActionController: VoicemailActionController;
  let entitySourceController: EntitySourceController<Voicemail>;
  let partialModifyController: PartialModifyController<Voicemail>;
  function setUp() {
    entitySourceController = new EntitySourceController(
      null as any,
      null as any,
    );
    partialModifyController = new PartialModifyController(
      entitySourceController,
    );
    voicemailActionController = new VoicemailActionController(
      entitySourceController,
      partialModifyController,
    );
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('construct', () => {
    it('should be type of VoicemailActionController', () => {
      const res = new VoicemailActionController(
        entitySourceController,
        partialModifyController,
      );
      expect(res).toBeInstanceOf(VoicemailActionController);
    });
  });
});
