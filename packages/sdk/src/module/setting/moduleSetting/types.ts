/*
 * @Author: Paynter Chen
 * @Date: 2019-05-24 12:18:14
 * Copyright © RingCentral. All rights reserved.
 */
import { UserSettingEntity } from '../entity';
import { Nullable } from 'sdk/types';
interface IUserSettingHandler<T = any> {
  id: number;
  userSettingEntityCache: UserSettingEntity<T>;
  on<E>(
    eventName: string,
    listener: (e: E) => Promise<void>,
    filter?: (e: E) => boolean,
  ): void;
  getUserSettingEntity(disableCache?: boolean): Promise<UserSettingEntity<T>>;
  updateValue(value: T): Promise<void>;
  notifyUserSettingEntityUpdate(newEntity: UserSettingEntity<T>): void;
  updateUserSettingEntityCache(entity: UserSettingEntity<T>): void;
  dispose(): void;
}

interface IModuleSetting {
  getById<T>(id: SettingEntityIds): Promise<Nullable<UserSettingEntity<T>>>;
  init(): void;
  dispose(): void;
}

enum SettingEntityIds {
  Phone_CallerId,
  Phone_Region,
  Phone_Extension,
  Phone_DefaultApp,
  Phone_MicrophoneSource,
  Phone_SpeakerSource,
  Phone_RingerSource,
  Phone_Volume,
  Notification_DirectMessages,
  Notification_Mentions,
  Notification_Teams,
  Notification_DailyDigest,
  Notification_Browser,
  Notification_NewMessages,
  Notification_IncomingCalls,
  Notification_MissCallAndNewVoiceMails,
  Notification_NewMessageBadgeCount,
}

export { IUserSettingHandler, SettingEntityIds, IModuleSetting };
