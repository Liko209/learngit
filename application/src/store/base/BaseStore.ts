/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-10 19:28:45
 * Copyright © RingCentral. All rights reserved.
 */
import BaseNotificationSubscribable from './BaseNotificationSubscribable';
import { ENTITY_NAME } from '../constants';
export default class BaseStore extends BaseNotificationSubscribable {
  name: ENTITY_NAME;
  constructor(name: ENTITY_NAME) {
    super();
    this.name = name;
  }
}
