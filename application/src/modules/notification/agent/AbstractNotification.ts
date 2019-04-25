/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { NotificationStore } from '../store/NotificationStore';

export abstract class AbstractNotification<T> {
  protected _store: NotificationStore<T>;
  constructor() {
    this._store = new NotificationStore();
  }
  abstract isSupported(): boolean;
  abstract create(title: string, opts: NotificationOptions): void;
  abstract close(scope: string, id: number): void;
  abstract clear(scope?: string): void;
}
