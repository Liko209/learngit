import { ProgressBar } from '../ProgressBar';
import { ProgressManager } from '../ProgressManager';
import { spyOnTarget } from 'sdk/__tests__/utils';
import { IProgressObserver } from '../types';
import NProgress from 'nprogress';
jest.mock('nprogress');

describe('ProgressManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('newProgressBar()', () => {
    it('should create ProgressBar', () => {
      const progressManager = new ProgressManager();
      const progressBar = progressManager.newProgressBar();
      progressBar.start();
      expect(progressManager['_progressInstances']).toEqual([progressBar]);
    });

    it('should update progress when ProgressBar update', () => {
      const progressManager = new ProgressManager();
      const progressBar = progressManager.newProgressBar();
      expect(NProgress.set).not.toBeCalled();
      progressBar.start();
      progressBar.update({
        lengthComputable: true,
        loaded: 10,
        total: 100,
      });
      expect(NProgress.set).lastCalledWith(0.1);
      progressBar.stop();
      expect(NProgress.set).lastCalledWith(1);
    });

    it('should work with multi ProgressBar', () => {
      const progressManager = new ProgressManager();
      const progressBar1 = progressManager.newProgressBar();
      const progressBar2 = progressManager.newProgressBar();
      progressBar1.start();
      progressBar2.start();
      progressBar1.update({
        lengthComputable: true,
        loaded: 10,
        total: 100,
      });
      expect(NProgress.set).lastCalledWith(0.05);
      progressBar2.update({
        lengthComputable: true,
        loaded: 10,
        total: 100,
      });
      expect(NProgress.set).lastCalledWith(0.1);
      progressBar1.stop();
      expect(NProgress.set).lastCalledWith(0.5 + 0.05);
      progressBar2.stop();
      expect(NProgress.set).lastCalledWith(1);
      jest.clearAllMocks();

      const newProgressBar = progressManager.newProgressBar();
      expect(NProgress.set).not.toBeCalled();
      newProgressBar.start();
      expect(NProgress.set).lastCalledWith(0);
      newProgressBar.update({
        lengthComputable: true,
        loaded: 10,
        total: 100,
      });
      expect(NProgress.set).lastCalledWith(0.1);
    });
  });
});
