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
  SoundsList,
  SETTING_KEYS,
  DESKTOP_MESSAGE_NOTIFICATION_OPTIONS,
  SOUNDS_TYPE,
  AUDIO_SOUNDS_INFO,
} from '../constants';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SettingService, SettingEntityIds } from 'sdk/module/setting';
import GroupService from 'sdk/module/group';
import { ProfileObserver } from '../types';
import { notificationCenter, ENTITY } from 'sdk/service';

class ConversationPreferenceHandler implements ProfileObserver {
  keys: SETTING_KEYS[] = [];
  constructor(keys: SETTING_KEYS[]) {
    this.keys = keys;
  }
  public async buildEntityInfo(profile: Nullable<Profile>, cid: number) {
    const notification = _.get(
      profile,
      `conversation_level_notifications.${cid}`,
    );
    const sound = _.get(profile, 'team_specific_audio_notifications', []).find(
      (item: AUDIO_NOTIFICATIONS) => item.gid === cid,
    );
    let model = {
      ...notification,
      muted: (notification && notification.muted) || false,
      audio_notifications:
        sound && SoundsList.find(item => item.id === sound.sound),
    } as ConversationPreference;
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
    if (!localProfile) {
      return this._getInitConversationIds(profile);
    }
    const changedIds = new Set<number>();
    if (notification) {
      const localNotification =
        localProfile[SETTING_KEYS.CONVERSATION_NOTIFICATION];
      // eslint-disable-next-line
      for (const id in notification) {
        if (
          !_.isEqual(
            notification[id],
            localNotification && localNotification[id],
          )
        ) {
          changedIds.add(+id);
        }
      }
    }
    if (audio) {
      const localAudio = localProfile[SETTING_KEYS.CONVERSATION_AUDIO] || [];
      _.difference(
        _.unionWith(audio, localAudio, _.isEqual),
        _.intersectionWith(audio, localAudio, _.isEqual),
      ).map(item => changedIds.add(item.gid));
    }
    return Array.from(changedIds);
  }

  private _getInitConversationIds(profile: Profile) {
    const ids = new Set<number>();
    const notification = profile[SETTING_KEYS.CONVERSATION_NOTIFICATION];
    const audio = profile[SETTING_KEYS.CONVERSATION_AUDIO];
    if (notification) {
      // eslint-disable-next-line
      for (const id in notification) {
        ids.add(+id);
      }
    }
    if (audio) {
      audio.map(item => ids.add(item.gid));
    }
    return Array.from(ids);
  }

  private async _getSettingValue<T>(settingId: SettingEntityIds) {
    const settingService = ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    );
    const model = await settingService.getById<T>(settingId);
    return (model && model.value)!;
  }
  private async _getTeamNotification(model: ConversationPreference) {
    model.desktop_notifications = await this._getValue(
      model.desktop_notifications,
      (await this._getSettingValue(
        SettingEntityIds.Notification_NewMessages,
      )) === DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE,
    );
    model.audio_notifications = await this._getAudioValue(
      model.audio_notifications,
      SettingEntityIds.Audio_TeamMessages,
    );
    model.email_notifications = await this._getValue(
      model.email_notifications,
      await this._getSettingValue(SettingEntityIds.Notification_Teams),
    );
    model.push_notifications = await this._getValue(
      model.push_notifications,
      await this._getSettingValue(SettingEntityIds.MOBILE_Team),
    );
    return model;
  }

  private async _getGroupNotification(model: ConversationPreference) {
    model.desktop_notifications = await this._getValue(
      model.desktop_notifications,
      (await this._getSettingValue(
        SettingEntityIds.Notification_NewMessages,
      )) !== DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF,
    );
    model.audio_notifications = await this._getAudioValue(
      model.audio_notifications,
      SettingEntityIds.Audio_DirectMessage,
    );
    model.email_notifications = await this._getValue(
      model.email_notifications,
      await this._getSettingValue(SettingEntityIds.Notification_DirectMessages),
    );
    model.push_notifications = await this._getValue(
      model.push_notifications,
      await this._getSettingValue(SettingEntityIds.MOBILE_DM),
    );
    return model;
  }
  private async _getValue<T>(
    value: UndefinedAble<T>,
    globalValue: T,
  ): Promise<T> {
    if (value === undefined) {
      return globalValue;
    }
    return value;
  }

  private async _getAudioValue(
    value: UndefinedAble<AUDIO_SOUNDS_INFO>,
    key: SettingEntityIds,
  ): Promise<AUDIO_SOUNDS_INFO> {
    if (value === undefined || value.id === SOUNDS_TYPE.Default) {
      return await this._getSettingValue(key);
    }
    return value;
  }
  private async _isTeam(conversationId: number) {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    const group = await groupService.getById(conversationId);
    return !!(group && group.is_team);
  }
}

export { ConversationPreferenceHandler };
