/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-26 15:10:47
 * Copyright © RingCentral. All rights reserved.
 */

import { Progress, PROGRESS_STATUS } from '../../../../module/progress';
import notificationCenter from '../../../../service/notificationCenter';
import { ENTITY } from '../../../../service/eventKey';
import { ProgressCacheController } from '../ProgressCacheController';

jest.mock('../../../../service/notificationCenter');

describe('ProgressCacheController', () => {
  let progressCacheController: ProgressCacheController;
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  function setup() {
    progressCacheController = new ProgressCacheController();

    const progressCache: Map<number, Progress> = new Map();
    for (let i = -10; i < 0; i++) {
      progressCache.set(i, { id: i, status: Math.abs(i) % 3 });
    }

    Object.assign(progressCacheController, { _progressCache: progressCache });
  }

  describe('getProgress()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should return cached progress', () => {
      for (let i = -10; i < 0; i++) {
        expect(progressCacheController.getProgress(i)).toEqual({
          id: i,
          status: Math.abs(i) % 3,
        });
      }
    });

    it('should return undefined when can not find the progress', () => {
      expect(progressCacheController.getProgress(111)).toBeUndefined();
    });
  });

  describe('addProgress()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should add new progress to cache and send notification', () => {
      const newProgress = {
        id: -66,
        status: PROGRESS_STATUS.INPROGRESS,
        rate: { loaded: 1, total: 10 },
      };
      progressCacheController.addProgress(-66, newProgress);
      expect(progressCacheController.getProgress(-66)).toMatchObject(
        newProgress,
      );
      expect(notificationCenter.emitEntityUpdate).toBeCalledWith(
        ENTITY.PROGRESS,
        [newProgress],
      );
    });
  });

  describe('updateProgress()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should update progress and send notification when input id is in cache', () => {
      const newProgress = {
        id: -5,
        status: PROGRESS_STATUS.CANCELED,
        rate: { loaded: 1, total: 10 },
      };
      progressCacheController.updateProgress(-5, newProgress);
      expect(notificationCenter.emitEntityUpdate).toBeCalledWith(
        ENTITY.PROGRESS,
        [newProgress],
      );
    });

    it('should not update progress when input id is in not cache', () => {
      progressCacheController.updateProgress(-99, { id: -99 });
      expect(notificationCenter.emitEntityUpdate).not.toBeCalled();
    });
  });

  describe('deleteProgress()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });
    it('should remove cache by input id', () => {
      expect(progressCacheController.getProgress(-5)).not.toBeUndefined();
      progressCacheController.deleteProgress(-5);
      expect(progressCacheController.getProgress(-5)).toBeUndefined();
      expect(notificationCenter.emitEntityDelete).toBeCalledWith(
        ENTITY.PROGRESS,
        [-5],
      );
    });
  });
});
