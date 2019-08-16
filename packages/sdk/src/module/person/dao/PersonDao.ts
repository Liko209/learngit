/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-31 13:45:00
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseDao } from '../../../framework/dao';
import { Person } from '../entity';
import { IDatabase } from 'foundation/db';

const GET_ALL_EXCEED_COUNT = 30000;

class PersonDao extends BaseDao<Person> {
  static COLLECTION_NAME = 'person';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(PersonDao.COLLECTION_NAME, db);
  }

  async getAll(): Promise<Person[]> {
    const query = this.createQuery().limit(GET_ALL_EXCEED_COUNT);
    const models = await query.toArray();
    if (models.length === GET_ALL_EXCEED_COUNT) {
      const exceedQuery = this.createQuery().greaterThan(
        'id',
        models[GET_ALL_EXCEED_COUNT - 1].id,
      );
      const exceedModels = await exceedQuery.toArray();
      models.push(...exceedModels);
    }
    return models;
  }

  async searchPeopleByKey(fullKeyword = ''): Promise<Person[]> {
    // TODO should refactor search in the feature
    const trimmedFullKeyword = fullKeyword.trim();
    const keywordParts = trimmedFullKeyword.split(' ');

    // no keyword
    if (trimmedFullKeyword.length === 0 || keywordParts.length === 0) return [];

    // 1 part
    if (keywordParts.length === 1) {
      const keyword = keywordParts[0];
      const q1 = this.createQuery().startsWith('first_name', keyword, true);
      const q2 = this.createQuery().startsWith('display_name', keyword, true);
      const q3 = this.createQuery().startsWith('email', keyword, true);
      return q1
        .or(q2)
        .or(q3)
        .toArray();
    }

    // more than 1 part
    const q1 = this.createQuery()
      .startsWith('first_name', keywordParts[0], true)
      .filter((item: Person) => (item.last_name
        ? item.last_name.toLowerCase().startsWith(keywordParts[1])
        : false));

    const q2 = this.createQuery()
      .startsWith('display_name', fullKeyword, true)
      .filter((item: Person) => (item.last_name
        ? item.last_name.toLowerCase().startsWith(keywordParts[1])
        : false));

    return q1.or(q2).toArray();
  }

  async getPersonsByIds(ids: number[]): Promise<Person[]> {
    return this.createQuery()
      .anyOf('id', ids)
      .filter((item: Person) => !item.deactivated)
      .toArray();
  }
}

export { PersonDao };
