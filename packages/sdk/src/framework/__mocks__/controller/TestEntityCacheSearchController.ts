import _ from 'lodash';

import { IEntityCacheSearchController } from '../../controller/interface/IEntityCacheSearchController';
import { IEntityCacheController } from '../../controller/interface/IEntityCacheController';
import { EntityCacheSearchController } from '../../controller/impl/EntityCacheSearchController';
import { IdModel } from '../../model';

const delegate = (
  getObject: Function,
  methodName: string,
  isAsync: boolean = true,
) => {
  return isAsync
    ? jest.fn().mockImplementation(async (...args) => {
      const object = getObject();
      return await object[methodName].call(object, ...args);
    })
    : jest.fn().mockImplementation((...args) => {
      const object = getObject();
      return object[methodName].call(object, ...args);
    });
};

export class TestEntityCacheSearchController<T extends IdModel = IdModel>
  implements IEntityCacheSearchController<T> {
  public entityCacheSearchController: IEntityCacheSearchController<T>;
  constructor(public entityCacheController: IEntityCacheController<T>) {
    this.entityCacheSearchController = new EntityCacheSearchController(
      entityCacheController,
    );
  }
  getEntity = delegate(
    () => this.entityCacheSearchController,
    'getEntity',
    true,
  );
  getMultiEntities = delegate(
    () => this.entityCacheSearchController,
    'getMultiEntities',
    true,
  );
  getEntities = delegate(
    () => this.entityCacheSearchController,
    'getEntities',
    true,
  );
  searchEntities = delegate(
    () => this.entityCacheSearchController,
    'searchEntities',
    true,
  );
  isFuzzyMatched = delegate(
    () => this.entityCacheSearchController,
    'isFuzzyMatched',
    false,
  );
  isSoundexMatched = delegate(
    () => this.entityCacheSearchController,
    'isSoundexMatched',
    false,
  );
  isStartWithMatched = delegate(
    () => this.entityCacheSearchController,
    'isStartWithMatched',
    false,
  );
  getTermsFromSearchKey = delegate(
    () => this.entityCacheSearchController,
    'getTermsFromSearchKey',
    false,
  );
  isInitialized = delegate(
    () => this.entityCacheSearchController,
    'isInitialized',
    false,
  );
}
