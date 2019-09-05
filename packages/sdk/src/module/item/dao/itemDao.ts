/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 14:58:00
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao } from '../../../framework/dao';
import { Item } from '../entity';
import { IDatabase } from 'foundation/db';
import { daoManager } from '../../../dao';
import { FileItemDao } from '../module/file/dao';
import { TaskItemDao } from '../module/task/dao';
import { EventItemDao } from '../module/event/dao';
import { NoteItemDao } from '../module/note/dao';
import { LinkItemDao } from '../module/link/dao';
import { GlipTypeUtil, TypeDictionary } from '../../../utils';
import { SubItemDao } from '../module/base/dao';
import { SanitizedItem } from '../module/base/entity/SanitizedItem';
import { IdModel } from '../../../framework/model/Model';
import _ from 'lodash';

const PUT_KEY = 'put';
const UPDATE_KEY = 'update';
class ItemDao extends BaseDao<Item> {
  static COLLECTION_NAME = 'item';

  private _viewDaoMap: Map<number, SubItemDao<SanitizedItem>> = new Map();

  constructor(db: IDatabase) {
    super(ItemDao.COLLECTION_NAME, db);

    this._setUpViewDaos();
  }

  private _setUpViewDaos() {
    const viewDaosMap = [
      { typeId: TypeDictionary.TYPE_ID_FILE, daoClass: FileItemDao },
      { typeId: TypeDictionary.TYPE_ID_TASK, daoClass: TaskItemDao },
      { typeId: TypeDictionary.TYPE_ID_EVENT, daoClass: EventItemDao },
      { typeId: TypeDictionary.TYPE_ID_PAGE, daoClass: NoteItemDao },
      { typeId: TypeDictionary.TYPE_ID_LINK, daoClass: LinkItemDao },
    ];
    viewDaosMap.forEach((value: { typeId: number; daoClass: any }) => {
      this._viewDaoMap.set(value.typeId, daoManager.getDao(value.daoClass));
    });
  }

  async isFileItemExist(
    groupId: number,
    fileName: string,
    excludePseudo: boolean,
  ): Promise<boolean> {
    const query = this._groupFileQuery(groupId, fileName, excludePseudo);
    return (await query.count()) > 0;
  }

  async getExistGroupFilesByName(
    groupId: number,
    fileName: string,
    excludePseudo: boolean,
  ): Promise<Item[]> {
    const query = this._groupFileQuery(
      groupId,
      fileName,
      excludePseudo,
    ).toArray();
    return query;
  }

  private _groupFileQuery(
    groupId: number,
    fileName: string,
    excludePseudo: boolean,
  ) {
    const query = this.createQuery()
      .equal('name', fileName)
      .contain('group_ids', groupId);
    if (excludePseudo) {
      query.greaterThan('id', 0);
    }
    return query;
  }

  private _getItemViewDao(id: number) {
    return this._getItemViewDaoByTypeId(GlipTypeUtil.extractTypeId(id));
  }

  private _getItemViewDaoByTypeId(typeId: number) {
    return this._viewDaoMap.get(typeId);
  }

  async doInTransaction(func: () => {}): Promise<void> {
    await this.getDb().ensureDBOpened();
    await this.getDb().getTransaction(
      'rw',
      [
        this.getDb().getCollection<ItemDao, number>(ItemDao.COLLECTION_NAME),
        this.getDb().getCollection<FileItemDao, number>(
          FileItemDao.COLLECTION_NAME,
        ),
        this.getDb().getCollection<TaskItemDao, number>(
          TaskItemDao.COLLECTION_NAME,
        ),
        this.getDb().getCollection<NoteItemDao, number>(
          NoteItemDao.COLLECTION_NAME,
        ),
        this.getDb().getCollection<LinkItemDao, number>(
          LinkItemDao.COLLECTION_NAME,
        ),
        this.getDb().getCollection<EventItemDao, number>(
          EventItemDao.COLLECTION_NAME,
        ),
      ],
      async () => {
        await func();
      },
    );
  }

  async clear(): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([super.clear(), this._clearAllViewDaos()]);
    });
  }

  private async _clearAllViewDaos() {
    const viewDaos = Array.from(this._viewDaoMap.values());
    await Promise.all(
      viewDaos.map((viewDao: any) => {
        viewDao.clear();
      }),
    );
  }

  async put(item: Item): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([super.put(item), this._putItemView(item)]);
    });
  }

  async bulkPut(array: Item[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([super.bulkPut(array), this._bulkPutItemViews(array)]);
    });
  }

  async update(partialItem: Partial<Item>): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.update(partialItem),
        this._updateItemView(partialItem),
      ]);
    });
  }

  async bulkUpdate(partialItems: Partial<Item>[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.bulkUpdate(partialItems),
        this._bulkUpdateItemViews(partialItems),
      ]);
    });
  }

  async delete(itemId: number): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([super.delete(itemId), this._deleteItemView(itemId)]);
    });
  }

  async bulkDelete(itemIds: number[]): Promise<void> {
    await this.doInTransaction(async () => {
      await Promise.all([
        super.bulkDelete(itemIds),
        this._bulkDeleteItemViews(itemIds),
      ]);
    });
  }

  private async _bulkPutItemViews(items: Item[]) {
    const filterResult = this._filterItems<Item>(items, true);
    const typeIds = Array.from(filterResult.keys());
    await Promise.all(
      typeIds.map((typeId: number) => {
        const items = filterResult.get(typeId) as Item[];
        const viewDao = this._getItemViewDaoByTypeId(typeId);
        if (viewDao) {
          const sanitizedItems = items.map((item: Item) =>
            viewDao.toSanitizedItem(item),
          );
          return viewDao.bulkPut(sanitizedItems);
        }
        return Promise.resolve();
      }),
    );
  }

  private async _putItemView(item: Item) {
    const viewDao = this._getItemViewDao(item.id);
    if (viewDao && viewDao.shouldSaveSubItem(item)) {
      await viewDao.put(viewDao.toSanitizedItem(item));
    }
  }

  private async _updateItemView(partialItem: Partial<Item>) {
    const id = partialItem.id ? partialItem.id : partialItem._id;
    if (id) {
      const viewDao = this._getItemViewDao(id);
      if (viewDao) {
        await viewDao.update(
          viewDao.toPartialSanitizedItem(partialItem),
          !!viewDao.shouldSaveSubItem(partialItem as Item),
        );
      }
    }
  }

  private async _bulkUpdateItemViews(partialItems: Partial<Item>[]) {
    const filterResult = this._filterItems(partialItems as Item[], false);
    const typeIds = Array.from(filterResult.keys());
    const promiseArr: Promise<void>[] = [];
    typeIds.forEach((typeId: number) => {
      const viewDao = this._getItemViewDaoByTypeId(typeId);
      if (viewDao) {
        const items = filterResult.get(typeId) as Item[];
        const groupedItems = _.groupBy(items, (x: Item) => {
          return viewDao.shouldSaveSubItem(x) ? PUT_KEY : UPDATE_KEY;
        });

        const putUpdatePromise = this._updateSubItemsWithPut(
          groupedItems[PUT_KEY] || [],
          viewDao,
        );
        putUpdatePromise && promiseArr.push(putUpdatePromise);

        const noPutUpdatePromise = this._updateSubItemsWithoutPut(
          groupedItems[UPDATE_KEY] || [],
          viewDao,
        );
        noPutUpdatePromise && promiseArr.push(noPutUpdatePromise);

        return promiseArr;
      }
      return [Promise.resolve()];
    });
    await Promise.all(promiseArr);
  }

  private async _updateSubItemsWithPut(
    canPutItems: Partial<Item>[],
    viewDao: SubItemDao<SanitizedItem>,
  ) {
    const canPutSubItems = canPutItems.map((partialItem: Item) =>
      viewDao.toPartialSanitizedItem(partialItem),
    );
    return (
      (canPutSubItems.length && viewDao.bulkUpdate(canPutSubItems, true)) ||
      undefined
    );
  }

  private async _updateSubItemsWithoutPut(
    noPutItems: Partial<Item>[],
    viewDao: SubItemDao<SanitizedItem>,
  ) {
    const noPutSubItems = noPutItems.map((partialItem: Item) =>
      viewDao.toPartialSanitizedItem(partialItem),
    );
    return (
      (noPutSubItems.length && viewDao.bulkUpdate(noPutSubItems, false)) ||
      undefined
    );
  }

  private async _deleteItemView(itemId: number) {
    const viewDao = this._getItemViewDao(itemId);
    if (viewDao) {
      await viewDao.delete(itemId);
    }
  }

  private async _bulkDeleteItemViews(itemIds: number[]) {
    const idModels = itemIds.map((key: number) => ({ id: key }));
    const filterResult = this._filterItems<IdModel>(idModels, false);
    const typeIds = Array.from(filterResult.keys());
    await Promise.all(
      typeIds.map((typeId: number) => {
        const viewDao = this._getItemViewDaoByTypeId(typeId);
        if (viewDao) {
          const idModes = filterResult.get(typeId) as IdModel[];
          return viewDao.bulkDelete(
            idModes.map((model: { id: number }) => model.id),
          );
        }

        return Promise.resolve();
      }),
    );
  }

  private _filterItems<K extends { id: number }>(items: K[], isPut: boolean) {
    const resultMap: Map<number, K[]> = new Map();
    items.forEach((value: K) => {
      const typeId = GlipTypeUtil.extractTypeId(value.id);
      const viewDao = this._getItemViewDaoByTypeId(typeId);
      if (viewDao && (!isPut || viewDao.shouldSaveSubItem(value))) {
        const itemArr = resultMap.get(typeId);
        itemArr ? itemArr.push(value) : resultMap.set(typeId, [value]);
      }
    });
    return resultMap;
  }
}

export { ItemDao };
