/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../model';
import { IEntityPersistentController } from '../interface/IEntityPersistentController';
import { IDao } from '../../../framework/dao';
import notificationCenter, {
  NotificationEntityPayload,
} from '../../../service/notificationCenter';
import { EVENT_TYPES } from '../../../service/constants';
import { IEntityCacheController } from '../interface/IEntityCacheController';
class EntityPersistentController<T extends IdModel = IdModel>
  implements IEntityPersistentController<T> {
  constructor(
    public dao?: IDao<T>,
    public entityCacheController?: IEntityCacheController<T>,
  ) {
    this._subscribeEntityChange();
  }

  async put(item: T | T[]): Promise<void> {
    if (this.dao) {
      await this.dao.put(item);
    }

    if (this.entityCacheController) {
      await this.entityCacheController.put(item);
    }
  }

  async bulkPut(array: T[]): Promise<void> {
    if (this.dao) {
      await this.dao.bulkPut(array);
    }
    if (this.entityCacheController) {
      await this.entityCacheController.bulkPut(array);
    }
  }

  async clear(): Promise<void> {
    if (this.dao) {
      await this.dao.clear();
    }
    if (this.entityCacheController) {
      await this.entityCacheController.clear();
    }
  }

  async delete(key: number): Promise<void> {
    if (this.dao) {
      await this.dao.delete(key);
    }
    if (this.entityCacheController) {
      await this.entityCacheController.delete(key);
    }
  }

  async bulkDelete(keys: number[]): Promise<void> {
    if (this.dao) {
      await this.dao.bulkDelete(keys);
    }
    if (this.entityCacheController) {
      await this.entityCacheController.bulkDelete(keys);
    }
  }

  async update(item: Partial<T> | Partial<T>[]): Promise<void> {
    if (this.dao) {
      await this.dao.update(item);
    }
    if (this.entityCacheController) {
      await this.entityCacheController.update(item);
    }
  }

  async bulkUpdate(array: Partial<T>[]): Promise<void> {
    if (this.dao) {
      await this.dao.bulkUpdate(array);
    }
    if (this.entityCacheController) {
      await this.entityCacheController.bulkUpdate(array);
    }
  }

  saveToMemory(entities: T[]): void {
    if (this.entityCacheController) {
      this.entityCacheController.bulkPut(entities);
    }
  }

  async get(key: number): Promise<T | null> {
    let item: T | null = null;
    if (this.entityCacheController) {
      item = await this.entityCacheController.get(key);
    }
    if (!item && this.dao) {
      item = await this.dao.get(key);
    }

    return item;
  }

  async batchGet(ids: number[], order?: boolean): Promise<T[]> {
    let items: T[] = [];
    if (this.entityCacheController) {
      items = await this.entityCacheController.batchGet(ids, order);
    }

    if (items.length !== ids.length && this.dao) {
      items = await this.dao.batchGet(ids, order);
      if (items && items.length && this.entityCacheController) {
        await this.entityCacheController.bulkPut(items);
      }
    }

    return items;
  }

  async getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]> {
    let items: T[] = [];
    if (this.entityCacheController) {
      items = await this.entityCacheController.getEntities(filterFunc);
    }

    if (items.length === 0 && this.dao) {
      items = await this.dao.getAll();
      if (items && items.length && this.entityCacheController) {
        await this.entityCacheController.bulkPut(items);
      }
    }

    return items;
  }

  getEntityName(): string {
    if (this.dao) {
      return this.dao.getEntityName();
    }

    if (this.entityCacheController) {
      return this.entityCacheController.getEntityName();
    }

    return 'unknown';
  }

  async getAll(): Promise<T[]> {
    let items: T[] = [];
    if (this.entityCacheController) {
      items = await this.entityCacheController.getAll();
    }

    if (items.length === 0 && this.dao) {
      items = await this.dao.getAll();
    }

    return items;
  }

  async getTotalCount(): Promise<number> {
    let totalCount: number = 0;
    if (this.entityCacheController) {
      totalCount = await this.entityCacheController.getTotalCount();
    }

    if (totalCount === 0 && this.dao) {
      totalCount = await this.dao.getTotalCount();
    }
    return totalCount;
  }

  getEntityNotificationKey() {
    const modelName = this.getEntityName().toUpperCase();
    return `ENTITY.${modelName}`;
  }

  private _subscribeEntityChange() {
    if (this.dao && this.entityCacheController) {
      const eventKey: string = this.getEntityNotificationKey();
      notificationCenter.on(
        eventKey,
        (payload: NotificationEntityPayload<T>) => {
          this._onCacheEntitiesChange(payload);
        },
      );
    }
  }

  private async _onCacheEntitiesChange(payload: NotificationEntityPayload<T>) {
    if (!this.entityCacheController) {
      return;
    }
    switch (payload.type) {
      case EVENT_TYPES.REPLACE:
        await this.entityCacheController.replace(
          payload.body.ids,
          payload.body.entities,
        );
        break;
      case EVENT_TYPES.UPDATE:
        await this.entityCacheController.updateEx(
          payload.body.entities,
          payload.body.partials,
        );
        break;
      case EVENT_TYPES.DELETE:
        await this.entityCacheController.bulkDelete(payload.body.ids);
        break;
    }
  }
}

export { EntityPersistentController };
