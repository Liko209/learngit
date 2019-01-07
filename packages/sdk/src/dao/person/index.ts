/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-23 23:58:00
 */
import { caseInsensitive as natureCompare } from 'string-natural-compare';
import { BaseDao } from '../base';
import { IPagination } from '../../types';
import { Person } from '../../module/person/entity';
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const DEFAULT_LIMIT = 50;
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

  async getAllCount(): Promise<number> {
    return this.createQuery().count();
  }

  async getPersonsByPrefix(
    prefix: string,
    { offset = 0, limit = DEFAULT_LIMIT }: Partial<IPagination> = {},
  ): Promise<Person[]> {
    if (prefix === '') return [];
    if (prefix === '#') return this._getPersonsNotStartsWithAlphabet({ limit });

    const persons = await this._searchPersonsByPrefix(prefix);
    // Sort after query to get better performance
    return persons
      .sort(this._personCompare.bind(this))
      .slice(offset, offset + limit);
  }

  async getPersonsOfEachPrefix({
    limit = DEFAULT_LIMIT,
  }: Partial<IPagination> = {}): Promise<Map<string, Person[]>> {
    const promises = [];
    const map: Map<string, Person[]> = new Map();
    const persons = await this.getAll(); // TODO improve performance

    // Find persons starts with a letter in a-Z
    ALPHABET.forEach((prefix: string) => {
      const filteredPersons = persons.filter((person: Person) => {
        const display_name = this._getNameOfPerson(person);
        return display_name && display_name.toLowerCase().indexOf(prefix) === 0;
      });
      map.set(prefix.toUpperCase(), filteredPersons.slice(0, limit));
    });

    // Find persons don't starts with a letter in a-Z
    promises.unshift(
      (async () => {
        const persons = await this._getPersonsNotStartsWithAlphabet({ limit });
        map.set('#', persons);
      })(),
    );

    await Promise.all(promises);

    return map;
  }

  async getPersonsCountByPrefix(prefix: string): Promise<number> {
    let length;
    if (prefix === '#') {
      length = this._getPersonsCountNotStartsWithAlphabet();
    } else {
      length = (await this._searchPersonsByPrefix(prefix)).length;
    }

    return length;
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

  private async _getPersonsNotStartsWithAlphabet({
    limit,
  }: {
    limit: number;
  }): Promise<Person[]> {
    return this.createQuery()
      .orderBy('display_name')
      .filter((person: Person) => {
        const display = this._getNameOfPerson(person);
        return !!display && !ALPHABET.includes(display[0].toLowerCase());
      })
      .limit(limit)
      .toArray();
  }

  private async _getPersonsCountNotStartsWithAlphabet(): Promise<number> {
    return this.createQuery()
      .orderBy('display_name')
      .filter((person: Person) => {
        const display = this._getNameOfPerson(person);
        return !!display && !ALPHABET.includes(display[0].toLowerCase());
      })
      .count();
  }

  private _personCompare(a: Person, b: Person) {
    const aName = this._getNameOfPerson(a);
    const bName = this._getNameOfPerson(b);
    return natureCompare(aName, bName);
  }

  private _getNameOfPerson(person: Person): undefined | string {
    return person && (person.display_name || person.first_name || person.email);
  }

  private async _searchPersonsByPrefix(prefix: string) {
    const q1 = this.createQuery().startsWith('first_name', prefix, true);
    const q2 = this.createQuery().startsWith('display_name', prefix, true);
    const q3 = this.createQuery().startsWith('email', prefix, true);
    const reg = new RegExp(`^${prefix}.*`, 'i');

    let persons = await q1
      .or(q2)
      .or(q3)
      .toArray();

    persons = persons.filter((person: Person) => {
      const { display_name, first_name } = person;
      return !(
        (display_name && !reg.test(display_name)) ||
        (!display_name && first_name && !reg.test(first_name))
      );
    });

    return persons;
  }
}

export default PersonDao;
