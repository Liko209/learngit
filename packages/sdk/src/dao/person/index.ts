/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-23 23:58:00
 */
import { caseInsensitive as natureCompare } from 'string-natural-compare';
import { BaseDao } from '../../framework/dao';
import { Person } from '../../module/person/entity';
import { IDatabase } from 'foundation';

class PersonDao extends BaseDao<Person> {
  static COLLECTION_NAME = 'person';
  // TODO, use IDatabase after import foundation module in
  constructor(db: IDatabase) {
    super(PersonDao.COLLECTION_NAME, db);
  }

  async getAll(): Promise<Person[]> {
    const persons: Person[] = await super.getAll();
    return persons.sort(this._personCompare.bind(this));
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
      .filter((item: Person) =>
        item.last_name
          ? item.last_name.toLowerCase().startsWith(keywordParts[1])
          : false,
      );

    const q2 = this.createQuery()
      .startsWith('display_name', fullKeyword, true)
      .filter((item: Person) =>
        item.last_name
          ? item.last_name.toLowerCase().startsWith(keywordParts[1])
          : false,
      );

    return q1.or(q2).toArray();
  }

  async getPersonsByIds(ids: number[]): Promise<Person[]> {
    return this.createQuery()
      .anyOf('id', ids)
      .filter((item: Person) => !item.deactivated)
      .toArray();
  }

  private _personCompare(a: Person, b: Person) {
    const aName = this._getNameOfPerson(a);
    const bName = this._getNameOfPerson(b);
    return natureCompare(aName, bName);
  }

  private _getNameOfPerson(person: Person): undefined | string {
    return person && (person.display_name || person.first_name || person.email);
  }
}

export default PersonDao;
