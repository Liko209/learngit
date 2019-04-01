/*
 * @Author: Paynter Chen
 * @Date: 2019-03-21 18:48:11
 * Copyright © RingCentral. All rights reserved.
 */
import { SentryErrorReporter } from './SentryErrorReporter';
import { IErrorReporter } from './types';

export class ErrorReporterProxy implements IErrorReporter {
  private _enabled: boolean;
  private _reporter: SentryErrorReporter;
  private _queue: (() => void)[] = [];
  private _isInit: boolean = false;
  constructor(enabled: boolean) {
    this._enabled = enabled;
    this._init();
  }

  report = (error: Error) => {
    if (this._isInit) {
      this._reporter.report(error);
    } else {
      this._pushToQueue(() => this._reporter.report(error));
    }
  }

  setUser = (user: { id: number; companyId: number; email: string }) => {
    if (this._isInit) {
      this._reporter.setUser(user);
    } else {
      this._pushToQueue(() => this._reporter.setUser(user));
    }
  }

  private _pushToQueue = (callback: () => void) => {
    this._enabled && this._queue.push(callback);
  }

  private _executeFromQueue = () => {
    this._enabled &&
      this._queue.forEach((callback: Function) => {
        callback();
      });
  }

  private _init = () => {
    if (this._enabled && !this._isInit) {
      this._reporter = new SentryErrorReporter();
      this._reporter.init().then(() => {
        this._isInit = true;
        this._executeFromQueue();
      });
    }
  }
}
