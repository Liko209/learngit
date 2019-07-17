/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-07-09 13:40:01
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from '../../log';
import _ from 'lodash';

type PowerMonitorEventHandler = (
  isLocked: boolean,
  isSuspended: boolean,
) => void;

const logTag = '[PowerMonitor]';
class PowerMonitor {
  private _isScreenLocked: boolean = false;
  private _isSuspended: boolean = false;
  private _lockHandlers: PowerMonitorEventHandler[] = [];
  private _unlockHandlers: PowerMonitorEventHandler[] = [];
  private _suspendHandlers: PowerMonitorEventHandler[] = [];
  private _resumeHandlers: PowerMonitorEventHandler[] = [];

  constructor() {
    mainLogger.info(`${logTag}PowerMonitor init`);
  }

  public isScreenLocked(): boolean {
    return this._isScreenLocked;
  }
  public isSuspended(): boolean {
    return this._isSuspended;
  }

  public onLock(handler: PowerMonitorEventHandler) {
    this._lockHandlers.push(handler);
  }

  public offLock(handler: PowerMonitorEventHandler) {
    _.remove(this._lockHandlers, item => item === handler);
  }

  public onUnlock(handler: PowerMonitorEventHandler) {
    this._unlockHandlers.push(handler);
  }

  public offUnlock(handler: PowerMonitorEventHandler) {
    _.remove(this._unlockHandlers, item => item === handler);
  }

  public onSuspend(handler: PowerMonitorEventHandler) {
    this._suspendHandlers.push(handler);
  }

  public offSuspend(handler: PowerMonitorEventHandler) {
    _.remove(this._suspendHandlers, item => item === handler);
  }

  public onResume(handler: PowerMonitorEventHandler) {
    this._resumeHandlers.push(handler);
  }

  public offResume(handler: PowerMonitorEventHandler) {
    _.remove(this._resumeHandlers, item => item === handler);
  }

  public offAll() {
    this._lockHandlers = [];
    this._unlockHandlers = [];
    this._suspendHandlers = [];
    this._resumeHandlers = [];
  }

  public onPowerMonitorEvent(actionName: string) {
    mainLogger.info(
      `${logTag}Locked[${this._isScreenLocked}], Suspended[${
        this._isSuspended
      }] ==> ${actionName}`,
    );

    if (!this._isScreenLocked && actionName === 'lock-screen') {
      this._isScreenLocked = true;
      this._performHandlers(this._lockHandlers);
    }
    if (this._isScreenLocked && actionName === 'unlock-screen') {
      this._isScreenLocked = false;
      this._performHandlers(this._unlockHandlers);
    }

    if (!this._isSuspended && actionName === 'suspend') {
      this._isSuspended = true;
      this._performHandlers(this._suspendHandlers);
    }
    if (this._isSuspended && actionName === 'resume') {
      this._isSuspended = false;
      this._performHandlers(this._resumeHandlers);
    }
  }

  private _performHandlers(handlers: PowerMonitorEventHandler[]) {
    handlers.forEach((handler: PowerMonitorEventHandler) => {
      handler(this._isScreenLocked, this._isSuspended);
    });
  }
}

const powerMonitor = new PowerMonitor();

export { powerMonitor, PowerMonitor };
