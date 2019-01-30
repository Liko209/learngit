/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../model';
import { IEntityPersistentController } from '../interface/IEntityPersistentController';
import { BaseDao } from '../../../dao';
class EntityPersistentController<T extends IdModel = IdModel>
  implements IEntityPersistentController<T> {
  constructor(
    public dao?: BaseDao<T>,
    public entityCacheController?: IEntityPersistentController<T>,
  ) {}

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

  async batchGet(ids: number[]): Promise<T[]> {
    let items: T[] = [];
    if (this.entityCacheController) {
      items = await this.entityCacheController.batchGet(ids);
    }

    if (items.length !== ids.length && this.dao) {
      items = await this.dao.batchGet(ids);
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
    }

    return items;
  }

  getEntityNotificationKey() {
    if (this.dao) {
      const modelName = this.dao.modelName.toUpperCase();
      const eventKey: string = `ENTITY.${modelName}`;
      return eventKey;
    }

    if (this.entityCacheController) {
      return this.entityCacheController.getEntityNotificationKey();
    }

    return 'unknown';
  }
}

export { EntityPersistentController };
