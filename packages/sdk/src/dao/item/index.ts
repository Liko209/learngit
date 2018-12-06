/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-24 23:25:03
 */

import { BaseDao } from '../base';
import { Item } from '../../models';
import { IDatabase } from 'foundation';

class ItemDao extends BaseDao<Item> {
  static COLLECTION_NAME = 'item';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(ItemDao.COLLECTION_NAME, db);
  }

  async getItemsByIds(ids: number[]): Promise<Item[]> {
    return (
      this.createQuery()
        .anyOf('id', ids)
        // .filter(item => !item.deactivated)
        .toArray()
    );
  }

  async getItemsByGroupId(groupId: number, limit?: number): Promise<Item[]> {
    const query = this.createQuery().contain('group_ids', groupId);
    return limit ? query.limit(limit).toArray() : query.toArray();
  }

  async isFileItemExist(groupId: number, fileName: string): Promise<boolean> {
    const query = this.createQuery()
      .equal('name', fileName)
      .contain('group_ids', groupId);
    return (await query.count()) > 0;
  }

  async getExistGroupFilesByName(
    groupId: number,
    fileName: string,
  ): Promise<Item[]> {
    const query = this.createQuery()
      .greaterThan('id', 0)
      .equal('name', fileName)
      .contain('group_ids', groupId)
      .toArray();
    return query;
  }
}

export default ItemDao;
