/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-08-22 17:03:25
 * Copyright © RingCentral. All rights reserved.
 */

import { EntityPersistentController } from 'sdk/framework/controller/impl/EntityPersistentController';
import { EntitySourceController } from 'sdk/framework/controller/impl/EntitySourceController';
import { EntityCacheController } from 'sdk/framework/controller/impl/EntityCacheController';
import { IdModel } from 'sdk/framework/model';
import { IdModelFocBuilder } from '../IdModelFocBuilder';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import { ISortableModelWithData } from '@/store/base';

describe('IdModelFocBuilder', () => {
  let entitySourceController: EntitySourceController<IdModel, number | string>;
  let entityPersistentController: EntityPersistentController<IdModel>;

  let entityCacheController: EntityCacheController<IdModel>;

  function setup() {
    entityCacheController = new EntityCacheController<IdModel>('IdModel');
    entityPersistentController = new EntityPersistentController(
      entityCacheController,
    );
    entitySourceController = new EntitySourceController<IdModel>(
      entityPersistentController,
      null as any,
    );
  }

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  describe('buildFoc', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should return correct foc', async () => {
      entityCacheController.bulkPut([
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
      ]);
      const foc = IdModelFocBuilder.buildFoc(
        entitySourceController,
        (model: IdModel) => {
          return { id: model.id, sortValue: model.id, data: model };
        },
        (model: IdModel) => {
          return model.id > 0;
        },
        (a: IdModel, b: IdModel) => {
          if (a.id > b.id) return 1;
          if (a.id < b.id) return -1;
          return 0;
        },
      );

      let result = await foc.fetchData(QUERY_DIRECTION.NEWER, 3);
      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
      expect(foc.hasMore(QUERY_DIRECTION.NEWER)).toBe(true);

      result = await foc.fetchData(QUERY_DIRECTION.NEWER, 3, 3);
      expect(result).toEqual([{ id: 4 }, { id: 5 }, { id: 6 }]);
      expect(foc.hasMore(QUERY_DIRECTION.NEWER)).toBe(false);

      const foc2 = IdModelFocBuilder.buildFoc(
        entitySourceController,
        (model: IdModel) => {
          return { id: model.id, sortValue: model.id, data: model };
        },
        (model: IdModel) => {
          return model.id > 0;
        },
        (a: IdModel, b: IdModel) => {
          if (a.id > b.id) return 1;
          if (a.id < b.id) return -1;
          return 0;
        },
      );
      foc2.listStore.first = jest.fn().mockImplementation(() => {
        return { id: 3 };
      });
      result = await foc2.fetchData(QUERY_DIRECTION.OLDER, 3);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
      expect(foc2.hasMore(QUERY_DIRECTION.OLDER)).toBe(false);
    });
  });
});
