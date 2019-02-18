/*
 * @Author: Lily.li
 * @Date: 2018-06-22 12:08:27
 * Copyright © RingCentral. All rights reserved.
 */
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
interface IProgressEvent {
  loaded: number;
  total: number;
  lengthComputable: boolean;
  [prop: string]: any;
}
export default class ProgressBar {
  private _start: boolean = false;

  start() {
    if (!this._start) {
      this._start = true;
      NProgress.configure({ showSpinner: false });
      NProgress.start();
    }
  }

  update(e: IProgressEvent) {
    if (e.lengthComputable) {
      const percentage = Math.min(Math.floor(Number(e.loaded) / e.total), 1);
      NProgress.inc(percentage);
    }
  }

  stop() {
    if (this._start) {
      this._start = false;
      NProgress.done();
    }
  }
}

const progressBar = new ProgressBar();
export { progressBar, IProgressEvent };
