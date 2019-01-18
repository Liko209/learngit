/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-13 09:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel, Raw } from '../../model';
import { DeactivatedDao, BaseDao } from '../../../dao';
import _ from 'lodash';
import { transform } from '../../../service/utils';
import { IRequestController } from '../interface/IRequestController';
import { IEntitySourceController } from '../interface/IEntitySourceController';
import { ControllerUtils } from '../ControllerUtils';

class EntitySourceController<T extends IdModel = IdModel>
  implements IEntitySourceController<T> {
  constructor(
    public dao: BaseDao<T>,
    public deactivatedDao: DeactivatedDao,
    public requestController: IRequestController<T>,
  ) {}

  async getEntity(id: number): Promise<T | null> {
    const result = await this.getEntityLocally(id);
    if (!result) {
      return this.requestController.get(id);
    }
    return result;
  }

  async getEntityLocally(id: number): Promise<T> {
    const result = await this.dao.get(id);
    return result || (await this.deactivatedDao.get(id));
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
      const deactivateModels = await this.deactivatedDao.batchGet(diffIds);
      models = _.concat(models, deactivateModels);
    }
    return models;
  }

  getEntityNotificationKey() {
    return ControllerUtils.getEntityNotificationKey(this.dao);
  }
}

export { EntitySourceController };
