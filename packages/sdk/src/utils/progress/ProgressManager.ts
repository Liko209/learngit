/*
 * @Author: Paynter Chen
 * @Date: 2019-04-16 18:03:11
 * Copyright © RingCentral. All rights reserved.
 */

import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { ProgressBar } from './ProgressBar';
import { IProgress, IProgressObserver } from './types';
import _ from 'lodash';

class ProgressManager {
  private _progressInstances: IProgress[] = [];
  private _progressObserver: IProgressObserver;

  constructor() {
    NProgress.configure({ showSpinner: false });
    this._progressObserver = {
      onStart: (progressInstance: IProgress) => {
        this._addProgressInstance(progressInstance);
        if (!NProgress.isStarted()) {
          NProgress.start();
        }
        NProgress.inc();
      },

      onProgress: (progressInstance: IProgress) => {
        this._updateProgress();
      },

      onStop: (progressInstance: IProgress) => {
        this._updateProgress();
      },
    };
  }

  private _addProgressInstance = (progressInstance: IProgress) => {
    !this._isProgressExist(progressInstance) &&
      this._progressInstances.push(progressInstance);
  }

  private _isProgressExist = (progressInstance: IProgress) => {
    return (
      this._progressInstances.findIndex(item => item === progressInstance) > -1
    );
  }

  private _updateProgress = () => {
    let progress = 1;
    if (this._progressInstances.length) {
      progress =
        _.sumBy(this._progressInstances, progressInstance =>
          progressInstance.getProgress(),
        ) / this._progressInstances.length;
      progress > NProgress.status && NProgress.set(progress);
    }
    if (progress === 1) {
      this._progressInstances = [];
      NProgress.done();
    }
  }

  newProgressBar = (): ProgressBar => {
    const progressBar = new ProgressBar(this._progressObserver);
    return progressBar;
  }
}
const progressManager = new ProgressManager();
export { progressManager, ProgressManager };
