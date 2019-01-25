/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../model';
import { DeactivatedDao } from '../../../dao';
import _ from 'lodash';
import { IRequestController } from '../interface/IRequestController';
import { IEntitySourceController } from '../interface/IEntitySourceController';
import { IEntityPersistentController } from '../interface/IEntityPersistentController';

class EntitySourceController<T extends IdModel = IdModel>
  implements IEntitySourceController<T> {
  constructor(
    public entityPersistentController: IEntityPersistentController<T>,
    public deactivatedDao: DeactivatedDao,
    public requestController?: IRequestController<T>,
  ) {}

  async put(item: T | T[]): Promise<void> {
    await this.entityPersistentController.put(item);
  }

  async bulkPut(array: T[]): Promise<void> {
    await this.entityPersistentController.bulkPut(array);
  }

  async clear(): Promise<void> {
    await this.entityPersistentController.clear();
  }

  async delete(key: number): Promise<void> {
    await this.entityPersistentController.delete(key);
  }

  async bulkDelete(keys: number[]): Promise<void> {
    await this.entityPersistentController.bulkDelete(keys);
  }

  async update(item: Partial<T> | Partial<T>[]): Promise<void> {
    await this.entityPersistentController.update(item);
  }

  async bulkUpdate(array: Partial<T>[]): Promise<void> {
    await this.entityPersistentController.bulkUpdate(array);
  }

  async get(key: number): Promise<T | null> {
    const result = await this.getEntityLocally(key);
    if (!result && this.requestController) {
      return this.requestController.get(key);
    }
    return result;
  }

  async batchGet(ids: number[]): Promise<T[]> {
    return await this.entityPersistentController.batchGet(ids);
  }

  async getAll(): Promise<T[]> {
    return await this.entityPersistentController.getAll();
  }

  async getTotalCount(): Promise<number> {
    return await this.entityPersistentController.getTotalCount();
  }

  getEntityNotificationKey(): string {
    return this.entityPersistentController.getEntityNotificationKey();
  }

  async getEntityLocally(id: number): Promise<T> {
    const result = await this.entityPersistentController.get(id);
    return result || (await this.deactivatedDao.get(id));
  }

  async getEntitiesLocally(
    ids: number[],
    includeDeactivated: boolean,
  ): Promise<T[]> {
    if (ids.length <= 0) {
      return [];
    }
    let models = await this.entityPersistentController.batchGet(ids);
    if (includeDeactivated && models.length !== ids.length) {
      const modelIds = models.map(model => model.id);
      const diffIds = _.difference(ids, modelIds);
      const deactivateModels = await this.deactivatedDao.batchGet(diffIds);
      models = _.concat(models, deactivateModels);
    }
    return models;
  }
}

export { EntitySourceController };
