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

export abstract class AbstractUserSettingHandler<T>
  implements IUserSettingHandler<T> {
  id: number;
  userSettingEntityCache: UserSettingEntity<T>;
  _subscriptions: { eventName: string; listener: (...values: any[]) => void }[];

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
    listener: (e: E) => Promise<void>,
    filter?: (e: E) => boolean,
  ): void {
    this._on(eventName, (e: E) => {
      this.userSettingEntityCache !== undefined &&
        (!filter || filter(e)) &&
        listener(e);
    });
  }
  abstract getUserSettingEntity(
    disableCache?: boolean,
  ): Promise<UserSettingEntity<T>>;
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
}
