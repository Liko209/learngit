import BaseNotificationSubscribable from './BaseNotificationSubscribable';
export default class BaseStore extends BaseNotificationSubscribable {
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
}
