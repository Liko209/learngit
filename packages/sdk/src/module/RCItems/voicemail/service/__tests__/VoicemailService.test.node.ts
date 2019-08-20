/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-27 17:13:41
 * Copyright © RingCentral. All rights reserved.
 */

import { VoicemailService } from '../VoicemailService';
import { VoicemailController } from '../../controller/VoicemailController';
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
      fetchData: jest.fn(),
      handleNotification: jest.fn(),
      doSync: jest.fn(),
      buildFilterFunc: jest.fn(),
    },
    voicemailBadgeController: {
      initializeUnreadCount: jest.fn(),
    },
    voicemailHandleDataController: {
      handleVoicemailEvent: jest.fn(),
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
    vmController = new VoicemailController(
      null as any,
      null as any,
      null as any,
    );
    vmService = new VoicemailService();
  }

  describe('buildFilterFunc', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should call all fetch controller', async () => {
      await vmService.buildFilterFunc({});
      expect(
        vmController.voicemailFetchController.buildFilterFunc,
      ).toHaveBeenCalled();
    });
  });

  describe('fetchVoicemails', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('fetchVoicemails', async () => {
      await vmService.fetchVoicemails({
        limit: 1,
        direction: 1 as any,
        anchorId: 1,
      });
      expect(
        vmController.voicemailFetchController.fetchData,
      ).toHaveBeenCalledWith({
        limit: 1,
        direction: 1,
        anchorId: 1,
      });
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
      ).toHaveBeenCalledWith(ids, false);
    });
  });

  describe('clearAllVoicemails', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('clearAllVoicemails', async () => {
      await vmService.clearAllVoicemails();
      expect(vmController.voicemailFetchController.clearAll).toHaveBeenCalled();
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
      ).toHaveBeenCalledWith(1, READ_STATUS.READ);
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
      ).toHaveBeenCalledWith('13');
    });
  });

  describe('_syncImmediately', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('_syncImmediately', async () => {
      await vmService['_syncImmediately']();
      expect(vmController.voicemailFetchController.doSync).toHaveBeenCalled();
    });
  });

  describe('_handleVoicemailEvent', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('_handleVoicemailEvent', async () => {
      const mockData = { mock: 'voicemail' } as any;
      await vmService['_handleVoicemailEvent'](mockData);
      expect(
        vmController.voicemailHandleDataController.handleVoicemailEvent,
      ).toHaveBeenCalledWith(mockData);
    });
  });

  describe('_initBadge', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('_initBadge', async () => {
      await vmService['_initBadge']();
      expect(
        vmController.voicemailBadgeController.initializeUnreadCount,
      ).toHaveBeenCalled();
    });
  });
});
