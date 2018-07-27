/*
 * @Author: Lily.li
 * @Date: 2018-06-22 12:08:27
 * Copyright © RingCentral. All rights reserved.
 */
import NProgress from 'nprogress';
interface IProgressEvent {
  loaded: number;
  total: number;
  lengthComputable: boolean;
  [prop: string]: any;
}
export default class ProgressBar {
  private _counter: number = 0;
  private _step: number = 1;
  private _isDone: boolean = false;

  get counter() {
    return this._counter;
  }
  start() {
    this._counter++;
    NProgress.start();
  }

  update(e: IProgressEvent) {
    let percentage = Math.min(Math.floor(Number(e.loaded) / e.total), 1);
    if (!e.lengthComputable) {
      this._step > 0 ? (this._step -= 0.1) : (this._step = 0);
      percentage -= this._step;
      requestAnimationFrame(() => {
        console.log((percentage * 100).toFixed(2) + '%');
        if (percentage <= 0.9 && !this._isDone) {
          NProgress.inc(percentage);
          this.update(e);
        } else {
          this.stop();
        }
      });
      return;
    }
    NProgress.inc(percentage);
  }

  stop() {
    if (--this._counter <= 0) {
      this._isDone = true;
      NProgress.done();
    }
  }
}

export const progressBar = new ProgressBar();
