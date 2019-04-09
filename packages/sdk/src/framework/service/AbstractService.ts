/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-06-24 13:47:01
 * Copyright © RingCentral. All rights reserved
 */

import { IService } from './IService';

abstract class AbstractService implements IService {
  private _isStarted: boolean = false;

  start() {
    this._isStarted = true;
    this.onStarted();
  }

  stop() {
    this._isStarted = false;
    this.onStopped();
  }

  isStarted(): boolean {
    return this._isStarted;
  }
  protected abstract onStarted(): void;
  protected abstract onStopped(): void;
}

export { AbstractService };
