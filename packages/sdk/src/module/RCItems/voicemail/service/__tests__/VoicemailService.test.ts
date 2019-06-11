/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-27 17:13:41
 * Copyright © RingCentral. All rights reserved.
 */

import { VoicemailService } from '../VoicemailService';
import { VoicemailController } from '../../controller/VoicemailController';
import { RCItemUserConfig } from '../../../config';
import { READ_STATUS } from 'sdk/module/RCItems/constants';

jest.mock('../../../config');

jest.mock('../../controller/VoicemailController', () => {
  const xx = {
    voicemailActionController: {
      deleteRcMessages: jest.fn(),
      updateReadStatus: jest.fn(),
      buildDownloadUrl: jest.fn(),
    },
    voicemailFetchController: {
      clearAll: jest.fn(),
      fetchVoicemails: jest.fn(),
      handleNotification: jest.fn(),
    },
  };
  return {
    VoicemailController: () => {
      return xx;
    },
  };
});

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('VoicemailService', () => {
  let vmService: VoicemailService;
  let vmController: VoicemailController;
  function setUp() {
    vmController = new VoicemailController(null as any, null as any);
    vmService = new VoicemailService();
  }

  describe('fetchVoicemails', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('fetchVoicemails', async () => {
      await vmService.fetchVoicemails(1, 1, 1);
      expect(
        vmController.voicemailFetchController.fetchVoicemails,
      ).toBeCalledWith(1, 1, 1);
    });
  });

  describe('deleteVoicemails', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('deleteVoicemails', async () => {
      const ids = [1, 2, 3];
      await vmService.deleteVoicemails(ids);
      expect(
        vmController.voicemailActionController.deleteRcMessages,
      ).toBeCalledWith(ids, false);
    });
  });

  describe('clearAllVoicemails', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('clearAllVoicemails', async () => {
      await vmService.clearAllVoicemails();
      expect(vmController.voicemailFetchController.clearAll).toBeCalled();
    });
  });

  describe('updateReadStatus', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('updateReadStatus', async () => {
      await vmService.updateReadStatus(1, READ_STATUS.READ);
      expect(
        vmController.voicemailActionController.updateReadStatus,
      ).toBeCalledWith(1, READ_STATUS.READ);
    });
  });

  describe('buildDownloadUrl', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('buildDownloadUri', async () => {
      await vmService.buildDownloadUrl('13');
      expect(
        vmController.voicemailActionController.buildDownloadUrl,
      ).toBeCalledWith('13');
    });
  });

  describe('_triggerSilentSync', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('_triggerSilentSync', async () => {
      await vmService['_triggerSilentSync']();
      expect(
        vmController.voicemailFetchController.handleNotification,
      ).toBeCalled();
    });
  });
});
