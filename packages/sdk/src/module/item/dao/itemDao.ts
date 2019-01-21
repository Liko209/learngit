/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 14:58:00
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao } from '../../../framework/dao';
import { Item } from './../entity';
import { IDatabase } from 'foundation';

class ItemDao extends BaseDao<Item> {
  static COLLECTION_NAME = 'item';
  constructor(db: IDatabase) {
    super(ItemDao.COLLECTION_NAME, db);
  }

  async getItemsByIds(ids: number[]): Promise<Item[]> {
    return this.createQuery()
      .anyOf('id', ids)
      .toArray();
  }

  async getItemsByGroupId(groupId: number, limit?: number): Promise<Item[]> {
    const query = this.createQuery().contain('group_ids', groupId);
    return limit ? query.limit(limit).toArray() : query.toArray();
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
}

export { ItemDao };
