/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-08-23 15:16:55
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Profile } from '../entity';
import { Nullable, UndefinedAble } from 'sdk/types';
import { ConversationPreference, AUDIO_NOTIFICATIONS } from '../entity/Profile';
import {
  SETTING_KEYS,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  SoundsListWithDefault,
} from '../constants';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SettingService, SettingEntityIds } from 'sdk/module/setting';
import GroupService from 'sdk/module/group';
import { IProfileObserver } from '../types';
import { notificationCenter, ENTITY } from 'sdk/service';

class ConversationPreferenceHandler implements IProfileObserver {
  keys: SETTING_KEYS[] = [];
  constructor(keys: SETTING_KEYS[]) {
    this.keys = keys;
  }
  public async buildEntityInfo(profile: Nullable<Profile>, cid: number) {
    const notification = _.get(
      profile,
      `${SETTING_KEYS.CONVERSATION_NOTIFICATION}.${cid}`,
    );
    const sound = _.get(profile, `${SETTING_KEYS.CONVERSATION_AUDIO}`, []).find(
      (item: AUDIO_NOTIFICATIONS) => item.gid === cid,
    );
    let model = {
      muted: (notification && notification.muted) || false,
      audioNotifications:
        sound && SoundsListWithDefault.find(item => item.id === sound.sound),
    } as ConversationPreference;
    notification &&
      Object.keys(notification).map(key => {
        const value = notification[key];
        if (value !== undefined) {
          model[_.camelCase(key)] = value;
        }
      });
    if (await this._isTeam(cid)) {
      model = await this._getTeamNotification(model);
    } else {
      model = await this._getGroupNotification(model);
    }
    return { id: cid, ...model };
  }

  async update(
    profile: Profile,
    originProfile: Nullable<Profile>,
  ): Promise<void> {
    const ids = this._getUpdateConversationIds(profile, originProfile);
    if (!ids.length) {
      return;
    }
    const promises = ids.map(id => this.buildEntityInfo(profile, id));
    const changedData = await Promise.all(promises);
    notificationCenter.emitEntityUpdate(
      ENTITY.CONVERSATION_PREFERENCE,
      changedData,
    );
  }

  private _getUpdateConversationIds(
    profile: Profile,
    localProfile: Nullable<Profile>,
  ) {
    const notification = profile[SETTING_KEYS.CONVERSATION_NOTIFICATION];
    const audio = profile[SETTING_KEYS.CONVERSATION_AUDIO];
    if (!notification && !audio) {
      return [];
    }
    return this._getChangedIds(profile, localProfile);
  }
  private _getChangedIds(profile: Profile, localProfile?: Nullable<Profile>) {
    const changedIds = new Set<number>();
    const notification = profile[SETTING_KEYS.CONVERSATION_NOTIFICATION];
    const audio = profile[SETTING_KEYS.CONVERSATION_AUDIO];
    if (notification) {
      const localNotification =
        localProfile && localProfile[SETTING_KEYS.CONVERSATION_NOTIFICATION];
      Object.keys(notification).map(id => {
        if (
          !localNotification ||
          !_.isEqual(notification[+id], localNotification[+id])
        ) {
          changedIds.add(+id);
        }
      });
    }
    if (audio) {
      const localAudio =
        (localProfile && localProfile[SETTING_KEYS.CONVERSATION_AUDIO]) || [];
      if (!localAudio.length) {
        audio.map(item => changedIds.add(item.gid));
      } else {
        _.difference(
          _.unionWith(audio, localAudio, _.isEqual),
          _.intersectionWith(audio, localAudio, _.isEqual),
        ).map(item => changedIds.add(item.gid));
      }
    }
    return Array.from(changedIds);
  }

  private async _getSettingValue<T>(settingId: SettingEntityIds) {
    const settingService = ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    );
    const model = await settingService.getById<T>(settingId);
    return (model && model.value)!;
  }
  private async _getTeamNotification(model: ConversationPreference) {
    model.desktopNotifications = await this._getDesktopValue(
      model.desktopNotifications,
      (await this._getSettingValue(
        SettingEntityIds.Notification_NewMessages,
      )) === DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE,
    );
    model.audioNotifications = await this._getValue(
      model.audioNotifications,
      SettingEntityIds.Audio_TeamMessages,
    );
    model.emailNotifications = await this._getValue(
      model.emailNotifications,
      SettingEntityIds.Notification_Teams,
    );
    model.pushNotifications = await this._getValue(
      model.pushNotifications,
      SettingEntityIds.MOBILE_Team,
    );
    return model;
  }

  private async _getGroupNotification(model: ConversationPreference) {
    model.desktopNotifications = await this._getDesktopValue(
      model.desktopNotifications,
      (await this._getSettingValue(
        SettingEntityIds.Notification_NewMessages,
      )) !== DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF,
    );
    model.audioNotifications = await this._getValue(
      model.audioNotifications,
      SettingEntityIds.Audio_DirectMessage,
    );
    model.emailNotifications = await this._getValue(
      model.emailNotifications,
      SettingEntityIds.Notification_DirectMessages,
    );
    model.pushNotifications = await this._getValue(
      model.pushNotifications,
      SettingEntityIds.MOBILE_DM,
    );
    return model;
  }
  private async _getValue<T>(
    value: UndefinedAble<T>,
    settingId: SettingEntityIds,
  ): Promise<T> {
    if (value === undefined) {
      return await this._getSettingValue(settingId);
    }
    return value;
  }

  private async _getDesktopValue<T>(
    value: UndefinedAble<T>,
    globalValue: T,
  ): Promise<T> {
    if (value === undefined) {
      return globalValue;
    }
    return value;
  }

  private async _isTeam(conversationId: number) {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    const group =
      groupService.getSynchronously(conversationId) ||
      (await groupService.getById(conversationId));
    return !!(group && group.is_team);
  }
}

export { ConversationPreferenceHandler };
