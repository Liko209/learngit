/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-14-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseModel, Raw } from '../../models';
import { daoManager, DeactivatedDao, BaseDao } from '../../dao';
import _ from 'lodash';
import { transform } from '../../service/utils';
import { RequestController } from './RequestController';

class EntitySourceController<T extends BaseModel = BaseModel> {
  constructor(
    public dao: BaseDao<T>,
    public requestController: RequestController<T>,
  ) {}

  async getEntity(id: number): Promise<T | null> {
    const result = await this.getEntityLocally(id);
    if (!result) {
      return this.requestController.requestDataById(id);
    }
    return result;
  }

  async getEntityLocally(id: number): Promise<T> {
    const result = await this.dao.get(id);
    return result || (await this._getDeactivatedEntityLocally(id));
  }

  async bulkUpdate(partialModels: Partial<Raw<T>>[]) {
    const transformedModels: T[] = [];
    partialModels.forEach((item: Partial<Raw<T>>) => {
      const transformedModel: T = transform(item);
      transformedModels.push(transformedModel);
    });

    if (this.dao) {
      await this.dao.bulkUpdate(transformedModels);
    }
  }

  async getEntitiesLocally(
    ids: number[],
    includeDeactivated: boolean,
  ): Promise<T[]> {
    if (ids.length <= 0) {
      return [];
    }
    let models = await this.dao.batchGet(ids);
    if (includeDeactivated && models.length !== ids.length) {
      const modelIds = models.map(model => model.id);
      const diffIds = _.difference(ids, modelIds);
      const deactivateModels = await this._getDeactivatedEntitiesLocally(
        diffIds,
      );
      models = _.concat(models, deactivateModels);
    }
    return models;
  }

  getEntityKey() {
    const modelName = this.dao.modelName.toUpperCase();
    const eventKey: string = `ENTITY.${modelName}`;
    return eventKey;
  }

  private async _getDeactivatedEntitiesLocally(ids: number[]): Promise<T[]> {
    const deactivatedDao = daoManager.getDao(DeactivatedDao);
    return await deactivatedDao.batchGet(ids);
  }

  private async _getDeactivatedEntityLocally(id: number): Promise<T> {
    const deactivatedDao = daoManager.getDao(DeactivatedDao);
    return await deactivatedDao.get(id);
  }
}

export { EntitySourceController };
