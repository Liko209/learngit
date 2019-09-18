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

  async getPersonsByIds(ids: number[]): Promise<Person[]> {
    return this.createQuery()
      .anyOf('id', ids)
      .filter((item: Person) => !item.deactivated)
      .toArray();
  }
}

export { PersonDao };
