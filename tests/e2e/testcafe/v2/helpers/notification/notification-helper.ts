/*
 * @Author: doyle.wu
 * @Date: 2019-04-24 09:35:25
 */
import { AbstractNotification } from './abstract-notification';
import { SWNotification } from './sw-notification';
import { DesktopNotification } from './desktop-notification';
import { ENABLE_NOTIFICATION, SITE_URL } from '../../../config';
import { ClientFunction, RequestMock } from 'testcafe';
import { INotification } from '../../models';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

class NotificationHelper {
  private notificationDistributors = new Map<string, AbstractNotification>();
  private notificationDistributor: AbstractNotification;

  constructor(private t: TestController) {
    this.notificationDistributors.set('sw', new SWNotification(t));
    this.notificationDistributors.set('desktop', new DesktopNotification(t));
  }

  async setup(): Promise<void> {
    if (!ENABLE_NOTIFICATION) {
      return;
    }

    const site = new URL(SITE_URL);
    const originScript = await axios.get(`${site.origin}/sw-notification.js`, { proxy: false });

    const injectScript = fs.readFileSync(path.join(__dirname, 'sw-inject-script.js'), 'utf-8');
    const swNotificationMock = RequestMock()
      .onRequestTo(/\/sw-notification.js/)
      .respond(
        [originScript.data, injectScript,].join('\n'),
        200, { "content-type": "application/javascript" });

    await this.t.addRequestHooks(swNotificationMock);
  }

  async support(): Promise<boolean> {
    if (!ENABLE_NOTIFICATION) {
      return false;
    }

    const getNotificationType = ClientFunction(() => {
      const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (!isElectron && !isSafari && navigator !== undefined && navigator.serviceWorker !== undefined) {
        return 'sw';
      }

      if (!!Notification) {
        return 'desktop';
      }
      return '';
    });

    const type = await getNotificationType();

    this.notificationDistributor = this.notificationDistributors.get(type);
    return !!this.notificationDistributor;
  }

  async withNotification(
    before: () => Promise<void>,
    callback: (notifications: Array<INotification>) => Promise<any>,
    timeout: number = 60e3): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.notificationDistributor) {
        reject('Notification not support.');
      }

      let timeoutId;

      timeoutId = setTimeout(() => {
        timeoutId = undefined;
        reject(`Can't receive any notification in ${timeout}ms`)
      }, timeout);

      this.notificationDistributor.inject().then(() => {
        before().then(() => {
          this.notificationDistributor.next().then(async (notifications) => {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            await callback(notifications);

            resolve();
          });
        })
      });
    });
  }

  async clickNotification(notification: INotification, action: string = 'click', timeout: number = 60e3): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.notificationDistributor) {
        reject('Notification not support.');
      }

      let timeoutId;

      timeoutId = setTimeout(() => {
        timeoutId = undefined;
        reject(`Can't click this notification[${notification.id}] in ${timeout}ms`)
      }, timeout);

      this.notificationDistributor.click(notification, action).then(() => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        resolve();
      });
    });
  }
}

export {
  NotificationHelper
}
