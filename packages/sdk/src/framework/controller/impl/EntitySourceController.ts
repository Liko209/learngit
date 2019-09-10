/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation/log';
import { IdModel, ModelIdType } from '../../model';
import { IDao } from '../../dao';
import _ from 'lodash';
import { IRequestController } from '../interface/IRequestController';
import { IEntitySourceController } from '../interface/IEntitySourceController';
import { IEntityPersistentController } from '../interface/IEntityPersistentController';

const LOG_TAG = 'EntitySourceController';
class EntitySourceController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> implements IEntitySourceController<T, IdType> {
  constructor(
    public entityPersistentController: IEntityPersistentController<T, IdType>,
    public deactivatedDao: IDao<T, IdType>,
    public requestConfig?: {
      requestController: IRequestController<T, IdType>;
      canSaveRemoteData: boolean;
      canRequest: () => boolean;
    },
  ) {}

  async put(item: T): Promise<void> {
    await this.entityPersistentController.put(item);
  }

  async bulkPut(array: T[]): Promise<void> {
    await this.entityPersistentController.bulkPut(array);
  }

  async clear(): Promise<void> {
    await this.entityPersistentController.clear();
  }

  async delete(key: IdType): Promise<void> {
    await this.entityPersistentController.delete(key);
  }

  async bulkDelete(keys: IdType[]): Promise<void> {
    await this.entityPersistentController.bulkDelete(keys);
  }

  async update(item: Partial<T>): Promise<void> {
    await this.entityPersistentController.update(item);
  }

  async bulkUpdate(array: Partial<T>[]): Promise<void> {
    await this.entityPersistentController.bulkUpdate(array);
  }

  async get(key: IdType): Promise<T | null> {
    let result = await this.getEntityLocally(key);
    if (!result && this._canRequest()) {
      result = await this._getEntityFromServer(key);
    }
    return result;
  }

  async batchGet(ids: IdType[], order?: boolean): Promise<T[]> {
    const idsSet = new Set<IdType>(ids);
    const validIds = [...idsSet];
    const existsEntities = await this.entityPersistentController.batchGet(
      validIds,
      order,
    );
    if (validIds.length === existsEntities.length) {
      return existsEntities;
    }

    let resultEntities = existsEntities;
    const existsIds = this._getIds(existsEntities);
    const diffIds = _.difference(validIds, existsIds);
    const deactivatedEntities = await this.deactivatedDao.batchGet(diffIds);
    if (deactivatedEntities.length) {
      this.entityPersistentController.saveToMemory &&
        this.entityPersistentController.saveToMemory(deactivatedEntities);
      resultEntities = resultEntities.concat(deactivatedEntities);
    }

    if (this._canRequest()) {
      const deactivatedIds = this._getIds(deactivatedEntities);
      const remoteIds = _.difference(diffIds, deactivatedIds);
      if (remoteIds && remoteIds.length) {
        const remoteEntities = await this._getEntitiesFromServer(remoteIds);
        if (remoteEntities && remoteEntities.length) {
          resultEntities = resultEntities.concat(remoteEntities);
        }
      }
    }

    if (order && resultEntities.length) {
      resultEntities = this._orderAsIds(validIds, resultEntities);
    }

    return resultEntities;
  }

  private _getIds(entities: T[]): IdType[] {
    return entities.map((entity: T) => entity.id);
  }

  private _orderAsIds(ids: IdType[], entities: T[]) {
    const entitiesMap: Map<IdType, T> = new Map();
    entities.forEach((entity: T) => {
      entitiesMap.set(entity.id, entity);
    });

    const orderedEntities: T[] = [];
    ids.forEach((id: IdType) => {
      const entity = entitiesMap.get(id);
      if (entity) {
        orderedEntities.push(entity);
      }
    });

    return orderedEntities;
  }

  private async _getEntityFromServer(key: IdType) {
    if (_.isNumber(key) && key < 0) {
      return null;
    }
    const result = await this.requestConfig!.requestController.get(key);
    if (this.requestConfig!.canSaveRemoteData && result) {
      await this.put(result);
    }
    return result;
  }

  private async _getEntitiesFromServer(remoteIds: IdType[]): Promise<T[]> {
    // TODO https://jira.ringcentral.com/browse/FIJI-3903
    const promises = remoteIds.map(async (id: IdType) => {
      try {
        return await this._getEntityFromServer(id);
      } catch (error) {
        mainLogger.tags(LOG_TAG).log('failed to _getEntitiesFromServer', error);
        return null;
      }
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

  async getEntities(
    filterFunc?: (entity: T) => boolean,
    sortFunc?: (entityA: T, entityB: T) => number,
  ): Promise<T[]> {
    return await this.entityPersistentController.getEntities(
      filterFunc,
      sortFunc,
    );
  }

  getEntityNotificationKey(): string {
    return this.entityPersistentController.getEntityNotificationKey();
  }

  async getEntityLocally(id: IdType): Promise<T | null> {
    const result = await this.entityPersistentController.get(id);
    return result || (await this.deactivatedDao.get(id));
  }

  async getEntitiesLocally(
    ids: IdType[],
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

  getRequestController(): IRequestController<T, IdType> | null {
    return this.requestConfig ? this.requestConfig.requestController : null;
  }

  private _canRequest() {
    return (
      this.requestConfig &&
      this.requestConfig.requestController &&
      this.requestConfig.canRequest()
    );
  }
}

export { EntitySourceController };
