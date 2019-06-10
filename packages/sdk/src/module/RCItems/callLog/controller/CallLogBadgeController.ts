/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-30 13:20:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { BadgeService } from 'sdk/module/badge';
import { notificationCenter, EVENT_TYPES, ENTITY } from 'sdk/service';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { mainLogger } from 'foundation';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { PERFORMANCE_KEYS, PerformanceTracer } from 'sdk/utils';
import { CallLog } from '../entity';
import { MISSED_CALL_BADGE_ID, CALL_RESULT } from '../constants';
import { Profile } from 'sdk/module/profile/entity';
import { UndefinedAble } from 'sdk/types';
import { BADGE_STATUS } from '../../constants';
import { ProfileService } from 'sdk/module/profile';

class CallLogBadgeController {
  private _unreadMap: Map<string, number>;
  private _badgeStatus: BADGE_STATUS;
  private _lastReadMissed: UndefinedAble<number>;

  constructor(
    private _sourceController: IEntitySourceController<CallLog, string>,
  ) {
    this.reset();
  }

  init() {
    notificationCenter.on(ENTITY.CALL_LOG, this.handleCallLogPayload);
    notificationCenter.on(ENTITY.PROFILE, this.handleProfile);
  }

  dispose() {
    notificationCenter.off(ENTITY.CALL_LOG, this.handleCallLogPayload);
    notificationCenter.off(ENTITY.PROFILE, this.handleProfile);
  }

  async initializeUnreadCount() {
    try {
      this._badgeStatus = BADGE_STATUS.INITIALIZING;
      const performanceTracer = PerformanceTracer.initial();
      const profile = await ServiceLoader.getInstance<ProfileService>(
        ServiceConfig.PROFILE_SERVICE,
      ).getProfile();
      this._lastReadMissed = profile.last_read_missed;
      const data = await this._sourceController.getEntities();
      data.forEach((data: CallLog) => {
        this._updateUnreadCount(data);
      });
      this._registerBadge();
      this._updateBadge();
      performanceTracer.end({
        key: PERFORMANCE_KEYS.INIT_RC_MESSAGE_BADGE,
        infos: { id: MISSED_CALL_BADGE_ID, count: this._unreadMap.size },
      });
      this._badgeStatus = BADGE_STATUS.INITIALIZED;
    } catch (err) {
      mainLogger
        .tags(MISSED_CALL_BADGE_ID)
        .warn('initializeUnreadCount error: ', err);
      this._badgeStatus = BADGE_STATUS.IDLE;
    }
  }

  reset() {
    this._unreadMap = new Map();
    this._badgeStatus = BADGE_STATUS.IDLE;
    this._lastReadMissed = undefined;
  }

  handleCallLogPayload = async (
    payload: NotificationEntityPayload<CallLog, string>,
  ) => {
    if (payload.type === EVENT_TYPES.UPDATE) {
      this.handleCallLogs(Array.from(payload.body.entities.values()));
    } else if (payload.type === EVENT_TYPES.RELOAD) {
      this.handleCallLogReload();
    } else if (payload.type === EVENT_TYPES.REPLACE) {
      this.handleCallLogReplace(payload.body.entities);
    }
  }

  handleProfile = async (payload: NotificationEntityPayload<Profile>) => {
    if (payload.type === EVENT_TYPES.UPDATE) {
      let unreadChanged = false;
      payload.body.entities.forEach((profile: Profile) => {
        if (!profile || !profile.last_read_missed) {
          return;
        }
        this._lastReadMissed = profile.last_read_missed;
        this._unreadMap.forEach((timestamp: number, id: string) => {
          if (this._lastReadMissed && this._lastReadMissed >= timestamp) {
            this._unreadMap.delete(id);
            unreadChanged = true;
          }
        });
      });
      if (this._badgeStatus === BADGE_STATUS.INITIALIZED && unreadChanged) {
        this._updateBadge();
      }
    }
  }

  handleCallLogReplace(replaceData: Map<string, CallLog>) {
    if (this._badgeStatus === BADGE_STATUS.IDLE) {
      this.initializeUnreadCount();
    }
    replaceData.forEach((callLog: CallLog, originId: string) => {
      this._unreadMap.delete(originId);
      this._updateUnreadCount(callLog);
    });
    if (this._badgeStatus === BADGE_STATUS.INITIALIZED) {
      this._updateBadge();
    }
  }

  handleCallLogReload() {
    this.reset();
    this._updateBadge();
    this.initializeUnreadCount();
  }

  async handleCallLogs(callLogs: CallLog[]) {
    if (this._badgeStatus === BADGE_STATUS.IDLE) {
      this.initializeUnreadCount();
    }
    let unreadChanged = false;
    callLogs.forEach((data: CallLog) => {
      this._updateUnreadCount(data) && (unreadChanged = true);
    });
    if (this._badgeStatus === BADGE_STATUS.INITIALIZED && unreadChanged) {
      this._updateBadge();
    }
  }

  private _updateUnreadCount(data: CallLog): boolean {
    if (data.result === CALL_RESULT.MISSED && !data.__deactivated) {
      if (!this._lastReadMissed || this._lastReadMissed < data.__timestamp) {
        this._unreadMap.set(data.id, data.__timestamp);
      } else {
        this._unreadMap.delete(data.id);
      }
      return true;
    }
    return false;
  }

  private _updateBadge(): void {
    const badge = {
      id: MISSED_CALL_BADGE_ID,
      unreadCount: this._unreadMap.size,
    };
    ServiceLoader.getInstance<BadgeService>(
      ServiceConfig.BADGE_SERVICE,
    ).updateBadge(badge);
    mainLogger.tags(MISSED_CALL_BADGE_ID).info('update badge: ', badge);
  }

  private _registerBadge() {
    ServiceLoader.getInstance<BadgeService>(
      ServiceConfig.BADGE_SERVICE,
    ).registerBadge(MISSED_CALL_BADGE_ID, () => {
      return { id: MISSED_CALL_BADGE_ID, unreadCount: this._unreadMap.size };
    });
  }
}

export { CallLogBadgeController };
