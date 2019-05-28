/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-24 16:48:02
 * Copyright © RingCentral. All rights reserved.
 */

import { EntityBaseService } from '../../../framework/service/EntityBaseService';
import { Badge } from '../entity';
import notificationCenter from 'sdk/service/notificationCenter';
import { ENTITY } from 'sdk/service/eventKey';
class BadgeService extends EntityBaseService<Badge, string> {
  private _badgeMap = new Map<string, () => Badge>();

  constructor() {
    super(false);
  }

  async getById(id: string): Promise<Badge | null> {
    let badge: Badge = { id, unreadCount: 0 };
    const getValueFunc = this._badgeMap.get(id);
    if (getValueFunc) {
      badge = getValueFunc();
    }
    return badge;
  }

  registerBadge(id: string, getValueFunc: () => Badge) {
    this._badgeMap.set(id, getValueFunc);
  }

  updateBadge(data: Badge) {
    notificationCenter.emitEntityUpdate<Badge, string>(ENTITY.BADGE, [data]);
  }
}

export { BadgeService };
