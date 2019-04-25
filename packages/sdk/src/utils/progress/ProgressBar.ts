/*
 * @Author: Lily.li
 * @Date: 2018-06-22 12:08:27
 * Copyright © RingCentral. All rights reserved.
 */
import { IProgress, IProgressObserver } from './types';
interface IProgressEvent {
  loaded: number;
  total: number;
  lengthComputable: boolean;
  [prop: string]: any;
}
class ProgressBar implements IProgress {
  private _start: boolean = false;
  private _progress: number = 1;

  constructor(private _progressBarObserver: IProgressObserver) {}

  isStart = () => {
    return this._start;
  }

  getProgress = () => {
    return this._progress;
  }

  start() {
    if (!this._start) {
      this._start = true;
      this._progress = 0;
      this._progressBarObserver.onStart(this);
    }
  }

  update(e: IProgressEvent) {
    if (e.lengthComputable) {
      const percentage = Math.min(Number(e.loaded) / Number(e.total), 1);
      this._progress += percentage;
      this._progressBarObserver.onProgress(this, this._progress);
    }
  }

  stop() {
    if (this._start) {
      this._start = false;
      this._progress = 1;
      this._progressBarObserver.onStop(this);
    }
  }
}

export { IProgressEvent, ProgressBar };
