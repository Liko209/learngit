/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-30 13:20:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { BadgeService } from 'sdk/module/badge';
import { notificationCenter, EVENT_TYPES } from 'sdk/service';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import {
  READ_STATUS,
  MESSAGE_AVAILABILITY,
  BADGE_STATUS,
} from '../../constants';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { RCMessage } from '../../types';
import { RC_ITEMS_POST_PERFORMANCE_KEYS } from '../../config/performanceKeys';

class RCMessageBadgeController<T extends RCMessage> {
  private _unreadMap: Map<number, boolean>;
  private _badgeStatus: BADGE_STATUS;
  private _unreadCount: number;

  constructor(
    private entityKey: string,
    private badgeId: string,
    private sourceController: IEntitySourceController<T>,
  ) {
    this.reset();
  }

  init() {
    notificationCenter.on(this.entityKey, this.handleVoicemailPayload);
  }

  dispose() {
    notificationCenter.off(this.entityKey, this.handleVoicemailPayload);
  }

  async initializeUnreadCount() {
    try {
      this._badgeStatus = BADGE_STATUS.INITIALIZING;
      const performanceTracer = PerformanceTracer.start();
      const data = await this.sourceController.getEntities();
      data.forEach((item: T) => {
        if (
          item.availability === MESSAGE_AVAILABILITY.ALIVE &&
          !this._unreadMap.has(item.id)
        ) {
          const isUnread = item.readStatus === READ_STATUS.UNREAD;
          if (isUnread) {
            ++this._unreadCount;
          }
          this._unreadMap.set(item.id, isUnread);
        }
      });
      this._registerBadge();
      this._updateBadge();
      performanceTracer.end({
        key: RC_ITEMS_POST_PERFORMANCE_KEYS.INIT_RC_MESSAGE_BADGE,
        infos: { id: this.badgeId, count: this._unreadCount },
      });
      this._badgeStatus = BADGE_STATUS.INITIALIZED;
    } catch (err) {
      mainLogger.tags(this.badgeId).warn('initializeUnreadCount error: ', err);
      this._badgeStatus = BADGE_STATUS.IDLE;
    }
  }

  reset() {
    this._unreadMap = new Map();
    this._badgeStatus = BADGE_STATUS.IDLE;
    this._unreadCount = 0;
  }

  handleVoicemailPayload = async (payload: NotificationEntityPayload<T>) => {
    if (payload.type === EVENT_TYPES.UPDATE) {
      this.handleVoicemails(Array.from(payload.body.entities.values()));
    } else if (payload.type === EVENT_TYPES.RELOAD) {
      this.handleVoicemailReload();
    }
  };

  async handleVoicemailReload() {
    this.reset();
    this._updateBadge();
    this.initializeUnreadCount();
  }

  async handleVoicemails(voicemails: T[]) {
    if (this._badgeStatus === BADGE_STATUS.IDLE) {
      this.initializeUnreadCount();
    }
    let unreadChanged = false;
    voicemails.forEach((data: T) => {
      const isLocalUnread = !!this._unreadMap.get(data.id);
      const isUnread = data.readStatus === READ_STATUS.UNREAD;
      if (data.availability !== MESSAGE_AVAILABILITY.ALIVE) {
        if (isLocalUnread) {
          this._unreadCount && --this._unreadCount;
          unreadChanged = true;
        }
        this._unreadMap.delete(data.id);
      } else if (isLocalUnread !== isUnread) {
        if (isUnread) {
          ++this._unreadCount;
        } else {
          this._unreadCount && --this._unreadCount;
        }
        unreadChanged = true;
        this._unreadMap.set(data.id, isUnread);
      }
    });
    if (this._badgeStatus === BADGE_STATUS.INITIALIZED && unreadChanged) {
      this._updateBadge();
    }
  }

  private _updateBadge(): void {
    const badge = {
      id: this.badgeId,
      unreadCount: this._unreadCount,
    };
    ServiceLoader.getInstance<BadgeService>(
      ServiceConfig.BADGE_SERVICE,
    ).updateBadge(badge);
    mainLogger.tags(this.badgeId).info('update badge: ', badge);
  }

  private _registerBadge() {
    ServiceLoader.getInstance<BadgeService>(
      ServiceConfig.BADGE_SERVICE,
    ).registerBadge(this.badgeId, () => ({
      id: this.badgeId,
      unreadCount: this._unreadCount,
    }));
  }
}

export { RCMessageBadgeController };
