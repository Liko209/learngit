/*
 * @Author: Andy Hu (Andy.hu@ringcentral.com)
 * @Date: 2019-04-01 15:16:45
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */
import { NotificationStore } from '../store/NotificationStore';

export abstract class AbstractNotification<T> {
  constructor(protected _store: NotificationStore<T>) {}
  abstract isSupported(): boolean;
  abstract create(title: string, opts: NotificationOptions): any;
  abstract close(scope: string, id: number): any;
  abstract clear(scope?: string): any;
}
