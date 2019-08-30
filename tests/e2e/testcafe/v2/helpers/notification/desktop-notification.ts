/*
 * @Author: doyle.wu
 * @Date: 2019-04-26 14:34:44
 */
import { ClientFunction } from 'testcafe';
import { INotification } from '../../models';
import { AbstractNotification } from './abstract-notification';

const INTERVAL_TIME = 200;

type DesktopSenderDto = {
  id: number;
  action: string;
  scope: string;
};

export class DesktopNotification extends AbstractNotification {
  private version: number = 0;
  private t: TestController;

  private senderStore: Map<number, DesktopSenderDto> = new Map();

  private injectDesktop = ClientFunction(() => {
    if (window["_injectDesktop"]) {
      console.log('Has inject desktop notification');
      return;
    }

    const _Notification = window['Notification'];

    Object.defineProperty(window, "_injectDesktop", { value: true });
    Object.defineProperty(window, "_notificationMap", { value: {} });
    Object.defineProperty(window, "_notificationIndex", { value: 0, writable: true });
    Object.defineProperty(window, "_Notification", { value: _Notification });


    (window['Notification'] as any) = function () {
      let n = new _Notification(arguments[0], arguments[1]);
      if (arguments[1] && arguments[1]['data'] && arguments[1]['data']['id']) {
        window['_notificationIndex'] = window['_notificationIndex'] + 1;
        window['_notificationMap'][arguments[1]['data']['id']] = { notification: n, index: window['_notificationIndex'] };
      }

      return n;
    };

    (window['Notification'] as any).permission = "granted";
    (window['Notification'] as any).requestPermission = function () {
      return _Notification.requestPermission();
    }
  });

  private getNotifications = ClientFunction(() => {
    return new Promise<any[]>((resolve) => {
      const result = [];
      let map = window['_notificationMap'];
      for (let key of Object.keys(map)) {
        let item = map[key];

        result.push({
          id: item.notification.data.id,
          scope: item.notification.data.scope,
          body: item.notification.body,
          title: item.notification.title,
          icon: item.notification.icon,
          index: item.index
        });
      }

      resolve(result);
    });
  });

  private postClickEvent = ClientFunction((id: any, action: string) => {
    let item = window['_notificationMap'][id];

    if (!item) {
      return;
    }

    if (action === 'close') {
      item.notification.close()
    } else {
      let event = new Event(action);
      item.notification.dispatchEvent(event);
    }
  });

  constructor(t: TestController) {
    super();

    this.t = t;
  }

  async inject(): Promise<void> {
    await this.injectDesktop();

    let notifications = await this.getNotifications();
    for (let item of notifications) {
      if (this.senderStore.has(item.id)) {
        continue;
      }

      this.senderStore.set(item.id, <DesktopSenderDto>{
        id: item.id,
        action: 'click',
        scope: item.scope
      });
    }
  }

  async next(): Promise<Array<INotification>> {
    return new Promise<Array<INotification>>((resolve, reject) => {
      const version = ++this.version;

      let isFind = false;
      let timerId = setInterval(async () => {
        if (version !== this.version) {
          if (timerId) {
            clearInterval(timerId);
            reject(`Get next notification failed.`);
          }
          return;
        }

        if (isFind) {
          if (timerId) {
            clearInterval(timerId);
          }
          return;
        }

        let result = [];
        let notifications = await this.getNotifications();
        for (let item of notifications) {
          if (this.senderStore.has(item.id)) {
            continue;
          }

          isFind = true;
          this.senderStore.set(item.id, <DesktopSenderDto>{
            id: item.id,
            action: 'click',
            scope: item.scope
          });

          result.push(<INotification>{
            id: item.id,
            title: item.title,
            body: item.body,
            icon: item.icon
          });
        }

        if (isFind) {
          resolve(result);
        }
      }, INTERVAL_TIME);
    });
  }

  async click(notification: INotification, action: string): Promise<void> {
    await this.postClickEvent(notification.id, action);
  }
}
