/*
 * @Author: Paynter Chen
 * @Date: 2019-05-24 12:18:14
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { UserSettingEntity } from '../entity';
import { IUserSettingHandler } from './types';
import { ENTITY, EVENT_TYPES } from 'sdk/service';
import notificationCenter, {
  NotificationEntityUpdatePayload,
  NotificationEntityDeletePayload,
} from 'sdk/service/notificationCenter';
import { ModelIdType } from 'sdk/framework/model';
import { UndefinedAble } from 'sdk/types';

export abstract class AbstractSettingEntityHandler<T>
  implements IUserSettingHandler<T> {
  id: number;
  userSettingEntityCache: UndefinedAble<UserSettingEntity<T>>;
  _subscriptions: {
    eventName: string;
    listener: (...values: any[]) => void;
  }[] = [];

  private _on(eventName: string, listener: (...values: any[]) => void) {
    notificationCenter.on(eventName, listener);
    this._subscriptions.push({ eventName, listener });
  }

  dispose() {
    this._subscriptions = this._subscriptions.filter(
      ({ eventName, listener }) => {
        notificationCenter.off(eventName, listener);
        return false;
      },
    );
  }

  on<E>(
    eventName: string,
    listener: (e: E) => Promise<void> | void,
    filter?: (e: E) => boolean,
  ): void {
    this._on(eventName, (e: E) => {
      this.userSettingEntityCache !== undefined &&
        (!filter || filter(e)) &&
        listener(e);
    });
  }

  async getUserSettingEntity(
    enableCache: boolean = false,
  ): Promise<UserSettingEntity<T>> {
    if (enableCache && this.userSettingEntityCache) {
      return this.userSettingEntityCache;
    }
    const result = await this.fetchUserSettingEntity();
    this.updateUserSettingEntityCache(result);
    return result;
  }

  abstract fetchUserSettingEntity(): Promise<UserSettingEntity<T>>;

  abstract updateValue(value: T): Promise<void>;

  notifyUserSettingEntityUpdate(newEntity: UserSettingEntity<T>): void {
    notificationCenter.emitEntityUpdate(ENTITY.USER_SETTING, [newEntity]);
  }

  updateUserSettingEntityCache(entity: UserSettingEntity<T>) {
    this.userSettingEntityCache = _.cloneDeep(entity);
  }

  onEntity() {
    return {
      onUpdate: <E, IdType extends ModelIdType = number>(
        eventName: string,
        listener: (
          payload: NotificationEntityUpdatePayload<E, IdType>,
        ) => Promise<void>,
        filter?: (
          payload: NotificationEntityUpdatePayload<E, IdType>,
        ) => boolean,
      ) => {
        this.on<NotificationEntityUpdatePayload<E, IdType>>(
          eventName,
          listener,
          payload =>
            payload.type === EVENT_TYPES.UPDATE && (!filter || filter(payload)),
        );
      },
      onDelete: <IdType extends ModelIdType = number>(
        eventName: string,
        listener: (
          payload: NotificationEntityDeletePayload<IdType>,
        ) => Promise<void>,
        filter?: (payload: NotificationEntityDeletePayload<IdType>) => boolean,
      ) => {
        this.on<NotificationEntityDeletePayload<IdType>>(
          eventName,
          listener,
          payload =>
            payload.type === EVENT_TYPES.DELETE && (!filter || filter(payload)),
        );
      },
    };
  }

  protected getCacheValue(key?: keyof T) {
    if (!this.userSettingEntityCache) {
      return undefined;
    }
    if (key) {
      return this.userSettingEntityCache.value
        ? this.userSettingEntityCache.value[key]
        : undefined;
    }
    return this.userSettingEntityCache.value;
  }
}
