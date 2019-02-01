/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-24 23:25:03
 */

import { BaseDao } from '../base';
import { Item } from '../../module/item/entity';
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

export default ItemDao;
