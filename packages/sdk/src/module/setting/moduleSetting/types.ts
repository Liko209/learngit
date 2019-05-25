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
  CallerId,
  Region,
  Extension,
}

export { IUserSettingHandler, SettingEntityIds, IModuleSetting };
