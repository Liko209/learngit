/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-08-14 11:21:38
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao } from 'sdk/dao';
import { IDatabase } from 'foundation/db';
import { ModelIdType, IdModel } from 'sdk/framework/model';
import { IViewDao } from './IViewDao';

abstract class AbstractComposedDao<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> extends BaseDao<T, IdType> {
  protected _viewDaos: IViewDao<IdType, T>[] = [];

  constructor(collectionName: string, db: IDatabase) {
    super(collectionName, db);
  }

  addViewDaos(viewDaos: IViewDao<IdType, T>[]) {
    this._viewDaos.push(...viewDaos);
  }

  async put(item: T): Promise<void> {
    await this.doInTransaction(async () => {
      const viewPromises = this._putView(item);
      await Promise.all([super.put(item), ...viewPromises]);
    });
  }

  async bulkPut(array: T[]): Promise<void> {
    await this.doInTransaction(async () => {
      const promises = this._bulkPutView(array);
      await Promise.all([super.bulkPut(array), ...promises]);
    });
  }

  async update(
    partialItem: Partial<T>,
    shouldDoPut: boolean = true,
  ): Promise<void> {
    await this.doInTransaction(async () => {
      const viewPromises = this._updateView(partialItem, shouldDoPut);
      await Promise.all([
        super.update(partialItem, shouldDoPut),
        ...viewPromises,
      ]);
    });
  }

  async bulkUpdate(
    partialItems: Partial<T>[],
    shouldDoPut: boolean = true,
  ): Promise<void> {
    await this.doInTransaction(async () => {
      const viewPromises = this._bulkUpdateViews(partialItems, shouldDoPut);
      await Promise.all([super.bulkUpdate(partialItems), ...viewPromises]);
    });
  }

  async delete(key: IdType): Promise<void> {
    await this.doInTransaction(async () => {
      const promises = [super.delete(key)].concat(
        this._viewDaos.map(v => v.delete(key)),
      );
      await Promise.all([promises]);
    });
  }

  async bulkDelete(keys: IdType[]): Promise<void> {
    await this.doInTransaction(async () => {
      const promises = [super.bulkDelete(keys)].concat(
        this._viewDaos.map(v => v.bulkDelete(keys)),
      );
      await Promise.all(promises);
    });
  }

  async clear(): Promise<void> {
    await this.doInTransaction(async () => {
      const promises = [super.clear()].concat(
        this._viewDaos.map(v => v.clear()),
      );
      await Promise.all(promises);
    });
  }

  private _updateView(partialEntity: Partial<T>, shouldDoPut: boolean) {
    const promises = this._viewDaos.map((v: IViewDao<IdType>) => {
      const viewEntity = v.toPartialViewItem(partialEntity);
      return v.update(viewEntity, shouldDoPut);
    });

    return promises;
  }

  private _bulkUpdateViews(partialItems: Partial<T>[], shouldDoPut: boolean) {
    const promises = this._viewDaos.map((v: IViewDao<IdType>) => {
      const partialViewEntities = partialItems.map(partialItem =>
        v.toPartialViewItem(partialItem),
      );
      return v.bulkUpdate(partialViewEntities, shouldDoPut);
    });

    return promises;
  }

  private _putView(entity: T) {
    const promises = this._viewDaos.map((v: IViewDao<IdType>) => {
      const viewEntity = v.toViewItem(entity);
      return v.put(viewEntity);
    });

    return promises;
  }

  private _bulkPutView(array: T[]) {
    const promises = this._viewDaos.map((v: IViewDao<IdType>) => {
      const viewEntities = array.map((entity: T) => v.toViewItem(entity));
      return v.bulkPut(viewEntities);
    });
    return promises;
  }

  async doInTransaction(func: () => {}): Promise<void> {
    const db = this.getDb();
    await db.ensureDBOpened();

    const viewCollections = this._viewDaos.map(v => {
      return v.getCollection();
    });
    const arr = [
      this.getDb().getCollection<T, IdType>(this.modelName),
      ...viewCollections,
    ];
    await this.getDb().getTransaction('rw', arr, async () => {
      await func();
    });
  }
}

export { AbstractComposedDao };
