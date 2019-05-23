/*
 * @Author: Paynter Chen
 * @Date: 2019-05-04 17:12:19
 * Copyright © RingCentral. All rights reserved.
 */
import { DateFormatter } from '../utils/DateFormatter';

export class SessionManager {
  private constructor() {}
  private static _instance: SessionManager;
  static getInstance() {
    if (!SessionManager._instance) {
      SessionManager._instance = new SessionManager();
    }
    return SessionManager._instance;
  }

  private sessionId: string;

  getSession() {
    if (!this.sessionId) {
      this.sessionId =
        (window as any).jupiterElectron &&
        (window as any).jupiterElectron.sessionId
          ? (window as any).jupiterElectron.sessionId
          : DateFormatter.formatDate();
    }
    return this.sessionId;
  }
}
