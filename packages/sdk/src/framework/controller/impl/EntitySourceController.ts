/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '../../model';
import { IDao } from '../../../framework/dao';
import _ from 'lodash';
import { IRequestController } from '../interface/IRequestController';
import { IEntitySourceController } from '../interface/IEntitySourceController';
import { IEntityPersistentController } from '../interface/IEntityPersistentController';

class EntitySourceController<T extends IdModel = IdModel>
  implements IEntitySourceController<T> {
  constructor(
    public entityPersistentController: IEntityPersistentController<T>,
    public deactivatedDao: IDao<T>,
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
      return await this.requestController.get(key);
    }
    return result;
  }

  async batchGet(ids: number[], order?: boolean): Promise<T[]> {
    const existsEntities = await this.entityPersistentController.batchGet(
      ids,
      order,
    );
    if (ids.length === existsEntities.length) {
      return existsEntities;
    }

    const existsIds = this._getIds(existsEntities);
    const diffIds = _.difference(ids, existsIds);
    const deactivatedEntities = await this.deactivatedDao.batchGet(diffIds);

    const deactivatedIds = this._getIds(deactivatedEntities);
    const remoteIds = _.difference(diffIds, deactivatedIds);
    const remoteEntities = await this._getEntitiesRemoteServer(remoteIds);

    let entities = existsEntities
      .concat(deactivatedEntities)
      .concat(remoteEntities);

    if (order && entities.length) {
      entities = this._orderAsIds(ids, entities);
    }

    return entities;
  }

  private _getIds(entities: T[]): number[] {
    return entities.map((entity: T) => {
      return entity.id;
    });
  }

  private _orderAsIds(ids: number[], entities: T[]) {
    const entitiesMap: Map<number, T> = new Map();
    entities.forEach((entity: T) => {
      entitiesMap.set(entity.id, entity);
    });

    const orderedEntities: T[] = [];
    ids.forEach((id: number) => {
      const entity = entitiesMap.get(id);
      if (entity) {
        orderedEntities.push(entity);
      }
    });

    return orderedEntities;
  }

  private async _getEntitiesRemoteServer(remoteIds: number[]): Promise<T[]> {
    // TODO https://jira.ringcentral.com/browse/FIJI-3903
    const promises = remoteIds.map(async (id: number) => {
      if (this.requestController) {
        try {
          return this.requestController.get(id);
        } catch {
          return null;
        }
      }
      return null;
    });

    const remoteEntities: T[] = [];
    await Promise.all(promises).then((results: (T | null)[]) => {
      results.forEach((result: T | null) => {
        if (result) {
          remoteEntities.push(result);
        }
      });
    });

    return remoteEntities;
  }

  getEntityName(): string {
    return this.entityPersistentController.getEntityName();
  }

  async getAll(): Promise<T[]> {
    return await this.entityPersistentController.getAll();
  }

  async getTotalCount(): Promise<number> {
    return await this.entityPersistentController.getTotalCount();
  }

  async getEntities(filterFunc?: (entity: T) => boolean): Promise<T[]> {
    return await this.entityPersistentController.getEntities(filterFunc);
  }

  getEntityNotificationKey(): string {
    return this.entityPersistentController.getEntityNotificationKey();
  }

  async getEntityLocally(id: number): Promise<T | null> {
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

  getRequestController(): IRequestController<T> | null {
    return this.requestController ? this.requestController : null;
  }
}

export { EntitySourceController };
