/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-24 17:23:46
 * Copyright © RingCentral. All rights reserved.
 */

import { observable } from 'mobx';
import { Badge } from 'sdk/module/badge/entity';
import Base from './Base';

export default class BadgeModel extends Base<Badge, string> {
  @observable
  unreadCount: number = 0;

  @observable
  mentionCount: number = 0;

  constructor(data: Badge) {
    super(data);
    this.unreadCount = data.unreadCount;
    this.mentionCount = data.mentionCount || 0;
  }

  static fromJS(data: Badge) {
    return new BadgeModel(data);
  }
}
