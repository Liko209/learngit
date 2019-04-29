/*
 * @Author: doyle.wu
 * @Date: 2019-04-24 10:05:29
 */
import { ClientFunction } from 'testcafe';
import { INotification } from '../../models';
import { AbstractNotification } from './abstract-notification';

type SWSenderDto = {
  id: any;
  action: string;
  scope: string;
};

type SWReceiverDto = {
  resolve: Function;
  reject: Function;
}

const INTERVAL_TIME = 200;

export class SWNotification extends AbstractNotification {
  private senderStore: Map<any, SWSenderDto> = new Map();

  private receiverStore: Map<number, SWReceiverDto> = new Map();

  private version: number = 0;

  private t: TestController;

  private getMessageIdList;

  private injectChannel = ClientFunction(() => {
    if (window['_injectChannel']) {
      console.log('Has inject injectChannel');
      return;
    }

    Object.defineProperty(window, "_injectChannel", { value: true });
    Object.defineProperty(window, "_messageIdList", { value: [] });
    Object.defineProperty(window, "_broadcastChannel", { value: new BroadcastChannel("sw-notification-channel") });

    window['_broadcastChannel'].addEventListener('message', event => {
      let messageId = event.data['meesageId'];
      if (messageId) {
        window['_messageIdList'].push(messageId);
      }
    });
  });

  private postClickEvent = ClientFunction((data: SWSenderDto) => {
    let channel: BroadcastChannel = window['_broadcastChannel'];
    channel.postMessage(data);
  });

  private injectServiceWorker = ClientFunction(() => {
    if (window["_injectServiceWorker"]) {
      console.log('Has inject ServiceWorker');
      return;
    }

    Object.defineProperty(window, "_injectServiceWorker", { value: true });

    Object.defineProperty(navigator.serviceWorker, "ready", {
      value: new Promise(resolve => {
        window.navigator.serviceWorker.getRegistration('/').then(registration => {
          resolve(registration);
        });
      })
    });
  });

  private getNotifications = ClientFunction(() => {
    return new Promise<any[]>((resolve) => {
      navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications().then(notifications => {
          const result = [];
          for (let item of notifications) {
            if (item.data.id) {
              result.push({
                id: item.data.id,
                scope: item.data.scope,
                body: item.body,
                title: item.title,
                icon: item.icon
              });
            }
          }

          resolve(result);
        })
      });
    });
  });

  constructor(t: TestController) {
    super();

    this.t = t;

    this.getMessageIdList = ClientFunction(() => {
      return window['_messageIdList'];
    }).with({ boundTestRun: this.t });
  }

  async inject(): Promise<void> {
    await this.injectChannel();
    await this.injectServiceWorker();

    let notifications = await this.getNotifications();
    for (let item of notifications) {
      if (this.senderStore.has(item.id)) {
        continue;
      }

      this.senderStore.set(item.id, <SWSenderDto>{
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
          this.senderStore.set(item.id, <SWSenderDto>{
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
    })
  }

  async click(notification: INotification, action: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.senderStore.has(notification.id)) {
        reject(`Notification id (${notification.id}) don't exist`);
      }

      const dto = this.senderStore.get(notification.id);
      if (action) {
        dto.action = action;
      }
      this.receiverStore.set(notification.id, <SWReceiverDto>{ resolve, reject });

      let isFind = false;
      this.postClickEvent(dto).then(() => {
        const version = ++this.version;

        let timerId = setInterval(() => {
          if (version !== this.version) {
            if (timerId) {
              clearInterval(timerId);
              reject(`Click notification failed.`);
            }
            return;
          }

          if (isFind) {
            if (timerId) {
              clearInterval(timerId);
            }
            return;
          }

          this.getMessageIdList().then((meesgeIds) => {
            for (let id of meesgeIds) {
              if (notification.id === id) {
                isFind = true;
              }

              let receiverDto = this.receiverStore.get(notification.id);

              if (receiverDto) {
                receiverDto.resolve();

                this.receiverStore.delete(notification.id);
              } else if (isFind) {
                resolve();
              }
            }
          });
        }, INTERVAL_TIME);
      });
    });
  }
}
