/*
 * @Author: doyle.wu
 * @Date: 2019-04-24 10:02:46
 */
import { INotification } from '../../models';

export abstract class AbstractNotification {
  constructor() { }

  abstract inject(): Promise<void>;

  abstract next(): Promise<INotification>;

  abstract click(notification: INotification): Promise<void>;
}

