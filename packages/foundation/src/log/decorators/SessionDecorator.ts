/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:59
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogEntityDecorator, LogEntity } from '../types';
import { SessionManager } from '../SessionManager';

export class SessionDecorator implements ILogEntityDecorator {
  options: object;
  private _sessionId: string;
  private _sessionIndex: number;
  constructor() {
    this.newSession();
  }

  newSession() {
    this._sessionId = SessionManager.getInstance().getSession();
    this._sessionIndex = 0;
  }

  getIndex() {
    return this._sessionIndex;
  }

  requestIndex() {
    return this._sessionIndex++;
  }

  decorate(data: LogEntity): LogEntity {
    data.sessionId = this._sessionId;
    data.sessionIndex = this.requestIndex();
    return data;
  }
}
