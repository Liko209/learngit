import { IStoreViewModel } from '@/store/inject';
import { AbstractViewModel } from '@/base/AbstractViewModel';
import BaseNotificationSubscribable from './base/BaseNotificationSubscribable';
import { Listener } from 'eventemitter2';

export default class StoreViewModel extends AbstractViewModel
  implements IStoreViewModel {
  subscribable: BaseNotificationSubscribable;

  constructor() {
    super();
    this.subscribable = new BaseNotificationSubscribable();
  }

  on(event: string | string[], listener: Listener) {
    return this.subscribable.on(event, listener);
  }

  emit(event: string | string[], ...values: any[]) {
    return this.subscribable.emit(event, ...values);
  }

  subscribeNotificationOnce(eventName: string, notificationCallback: Listener) {
    return this.subscribable.subscribeNotificationOnce(
      eventName,
      notificationCallback,
    );
  }

  subscribeNotification(eventName: string, notificationCallback: Listener) {
    return this.subscribable.subscribeNotification(
      eventName,
      notificationCallback,
    );
  }

  getNotificationObservers() {
    return this.subscribable.getNotificationObservers();
  }

  dispose() {
    this.subscribable.dispose();
  }
}
