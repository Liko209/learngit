/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-26 10:43:30
 * Copyright © RingCentral. All rights reserved.
 */
import { ProgressService } from '../ProgressService';
import { ProgressCacheController } from '../../controller/ProgressCacheController';

jest.mock('../../controller/ProgressCacheController');

describe('ProgressService', () => {
  let progressService: ProgressService;
  let progressCacheController: ProgressCacheController;
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  function setup() {
    progressService = new ProgressService();
    progressCacheController = new ProgressCacheController();
    Object.assign(progressService, {
      _progressCacheController: progressCacheController,
    });
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('ProgressCacheController', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    describe('addProgress()', () => {
      it('should call addProgress api in ProgressCacheController', () => {
        progressService.addProgress(-1, { id: -1 });
        expect(progressCacheController.addProgress).toBeCalledWith(-1, {
          id: -1,
        });
      });
    });

    describe('updateProgress()', () => {
      it('should call updateProgress api in ProgressCacheController', () => {
        progressService.updateProgress(-1, { id: -1 });
        expect(progressCacheController.updateProgress).toBeCalledWith(-1, {
          id: -1,
        });
      });
    });

    describe('deleteProgress()', () => {
      it('should call deleteProgress api in ProgressCacheController', () => {
        progressService.deleteProgress(-1);
        expect(progressCacheController.deleteProgress).toBeCalledWith(-1);
      });
    });

    describe('getById()', () => {
      it('should call getProgress api in ProgressCacheController', () => {
        progressService.getByIdSync(-1);
        expect(progressCacheController.getProgress).toBeCalledWith(-1);
      });
    });
  });
});
