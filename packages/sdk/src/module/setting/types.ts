import { UserSettingEntity } from './entity';
import { Nullable } from 'sdk/types';
interface IUserSettingHandler<T> {
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
}

interface IModuleSetting {
  getById<T>(id: SettingEntityIds): Promise<Nullable<UserSettingEntity<T>>>;
}

enum SettingEntityIds {
  CallerId,
  Region,
  Extension,
}

export { IUserSettingHandler, SettingEntityIds, IModuleSetting };
