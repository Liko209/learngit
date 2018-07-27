/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-24 00:04:37
 */
import PersonDao from '../';
import { setup } from '../../__tests__/utils';
import { extractDisplayNames } from '../../../__tests__/utils';
import _ from 'lodash';
import { Person } from '../../../models';
import { personFactory } from '../../../__tests__/factories';
import Factory from 'factory.ts';

describe('PersonDao', () => {
  let personDao: PersonDao;
  let mockData: Person[];

  beforeAll(() => {
    const { database } = setup();
    personDao = new PersonDao(database);
  });

  beforeEach(async () => {
    await personDao.clear();
    mockData = [
      {
        id: 1,
        created_at: 12,
        creator_id: 2335,
        first_name: 'Bill',
        last_name: 'Wang',
        display_name: 'Bill Wang',
        email: 'bill.wang@ringcentral.com',
        deactivated: false
      },
      {
        id: 2,
        created_at: 12,
        creator_id: 2335,
        first_name: 'Alvin',
        last_name: 'Mao',
        display_name: 'Alvin Mao',
        email: 'alvin.mao@ringcentral.com',
        deactivated: false
      },
      {
        id: 3,
        created_at: 12,
        creator_id: 2335,
        first_name: 'Albert',
        last_name: 'Chen',
        display_name: 'Albert Chen',
        email: 'albert.chen@ringcentral.com',
        deactivated: false
      },
      {
        id: 4,
        created_at: 12,
        creator_id: 2335,
        first_name: 'Devin',
        last_name: 'Lin',
        display_name: 'Devin Lin',
        email: 'devin.lin@ringcentral.com',
        deactivated: false
      },
      {
        id: 5,
        created_at: 12,
        creator_id: 2335,
        first_name: 'Boy',
        last_name: 'lin',
        display_name: 'boy lin',
        email: 'boy.lin@ringcentral.com',
        deactivated: false
      },
      {
        id: 6,
        created_at: 12,
        creator_id: 2335,
        first_name: 'Lip',
        last_name: 'Wang',
        display_name: 'Lip Wang',
        email: 'lip.wang@ringcentral.com',
        deactivated: false
      },
      {
        id: 7,
        created_at: 12,
        creator_id: 2335,
        first_name: '--',
        last_name: '---',
        display_name: '-----tester',
        email: 'test1@ringcentral.com',
        deactivated: false
      },
      {
        id: 8,
        created_at: 12,
        creator_id: 2335,
        first_name: 'first_name',
        display_name: 'I have no last_name',
        email: 'god@ringcentral.com'
      },
      {
        id: 9,
        created_at: 12,
        creator_id: 2335,
        first_name: 'first_name',
        email: 'god@ringcentral.com'
      },
      {
        id: 10,
        created_at: 12,
        creator_id: 2335,
        email: '123god@ringcentral.com'
      }
    ];
    await personDao.bulkPut(mockData);
  });

  it('Save items', async () => {
    const person: Person = personFactory.build({ id: 100, email: 'steve.chen@ringcentral.com' });
    await personDao.put(person);
    const matchedPerson = await personDao.get(100);
    expect(matchedPerson).toMatchObject(person);
  });

  describe('getAll()', () => {
    it('should order by display_name', async () => {
      let all = await personDao.getAll();
      let names = _.map(all, 'display_name');
      names = names.filter(item => item);
      expect(names).toEqual([
        '-----tester',
        'Albert Chen',
        'Alvin Mao',
        'Bill Wang',
        'boy lin',
        'Devin Lin',
        'I have no last_name',
        'Lip Wang'
      ]);
    });
  });

  describe('searchPeopleByKey()', () => {
    describe('when keyword has one part', () => {
      it('should return matched person', async () => {
        let persons = await personDao.searchPeopleByKey('li');
        expect(_.map(persons, 'display_name')).toEqual(['Lip Wang']);
      });

      it('should return [] when search an empty string', async () => {
        let persons = await personDao.searchPeopleByKey(' ');
        expect(persons).toEqual([]);
      });

      it('should return [] when no keyword', async () => {
        let persons = await personDao.searchPeopleByKey();
        expect(persons).toEqual([]);
      });
    });

    describe('when keyword has multi parts', () => {
      it('should work', async () => {
        let persons = await personDao.searchPeopleByKey('albert c');
        expect(_.map(persons, 'display_name')).toEqual(['Albert Chen']);
      });

      it('should not match when first_name matched but person has not last_name', async () => {
        let persons = await personDao.searchPeopleByKey('first_name a');
        expect(persons).toEqual([]);
      });

      it('should not match when display_name matched but person has not last_name', async () => {
        let persons = await personDao.searchPeopleByKey('I have no last_name');
        expect(persons).toEqual([]);
      });
    });
  });

  describe('getPersonsByPrefix()', () => {
    it('should return persons that first letter is A', async () => {
      const persons = await personDao.getPersonsByPrefix('A');
      const personNames = extractDisplayNames(persons);

      expect(personNames).toContain('Alvin Mao');
      expect(personNames).toContain('Albert Chen');
    });

    it('should return [] when prefix is empty', async () => {
      const persons = await personDao.getPersonsByPrefix('');
      expect(persons).toHaveLength(0);
    });

    it('should should order by display_name by default', async () => {
      const persons = await personDao.getPersonsByPrefix('A');
      const personNames = extractDisplayNames(persons);
      expect(personNames).toEqual(['Albert Chen', 'Alvin Mao']);
    });

    it('should support offset/limit', async () => {
      const persons = await personDao.getPersonsByPrefix('A', { offset: 1, limit: 1 });
      const personNames = extractDisplayNames(persons);

      expect(personNames).toEqual(['Alvin Mao']);
    });

    it('should return correct length when prefix is #', async () => {
      const persons = await personDao.getPersonsByPrefix('#');
      expect(persons).toHaveLength(1);
    });
  });

  describe('getPersonsOfEachPrefix()', () => {
    it('should return persons of each prefix', async () => {
      const personsOfEachPrefix = await personDao.getPersonsOfEachPrefix();
      expect(personsOfEachPrefix.get('#').length).toBe(1);
      expect(_.map(personsOfEachPrefix.get('A'), 'display_name')).toEqual(['Albert Chen', 'Alvin Mao']);
      expect(_.map(personsOfEachPrefix.get('B'), 'display_name')).toEqual(['Bill Wang', 'boy lin']);
      expect(_.map(personsOfEachPrefix.get('D'), 'display_name')).toEqual(['Devin Lin']);
    });

    it('should should work with limit', async () => {
      const personsOfEachPrefix = await personDao.getPersonsOfEachPrefix({ limit: 1 });
      expect(personsOfEachPrefix.get('A')).toHaveLength(1);
    });
  });

  it('query all persons and delete person', async () => {
    await personDao.bulkPut(
      personFactory
        .extend({
          id: Factory.each(i => 99 + i),
          email: 'steve.chen@ringcentral.com'
        })
        .buildList(5)
    );

    let all = await personDao.getAll();
    expect(all).toHaveLength(15);

    const result = await personDao.delete(100);
    expect(result).toBeUndefined();

    all = await personDao.getAll();
    expect(all).toHaveLength(14);
  });

  describe('getPersonsCountByPrefix()', () => {
    it('should return correct length if prefix is not #', async () => {
      const mock = 3;
      await personDao.bulkPut(
        personFactory
          .extend({
            id: Factory.each(i => 99 + i),
            display_name: 'Abc'
          })
          .buildList(mock)
      );
      const length = await personDao.getPersonsCountByPrefix('A');
      expect(length).toBe(mock + 2);
    });

    it('should return correct length if prefix is #', async () => {
      const mock = 3;
      await personDao.bulkPut(
        personFactory
          .extend({
            id: Factory.each(i => 99 + i),
            display_name: '12452846821684'
          })
          .buildList(mock)
      );
      const length = await personDao.getPersonsCountByPrefix('#');
      expect(length).toBe(mock + 1);
    });
  });
  describe('searchPeopleByKey()', () => {
    beforeAll(async () => {
      await personDao.bulkPut([
        personFactory.build({
          id: 11,
          first_name: 'steve',
          last_name: 'chen',
          email: 'steve.chen@ringcentral.com'
        }),
        personFactory.build({
          id: 12,
          first_name: 'shining',
          last_name: 'mao',
          display_name: 'shining mao',
          email: 'shining.mao@ringcentral.com'
        }),
        personFactory.build({
          id: 13,
          first_name: 'lip',
          last_name: 'wang',
          email: 'lip.wang@ringcentral.com'
        }),
        personFactory.build({
          id: 15,
          first_name: 'devin',
          last_name: 'lin',
          email: 'devin.lin@ringcentral.com'
        }),
        personFactory.build({
          id: 16,
          first_name: 'jeffrey',
          last_name: 'lin',
          email: 'jeffrey.lin@ringcentral.com'
        }),
        personFactory.build({
          id: 17,
          display_name: 'lip wang',
          email: 'lip.wang@ringcentral.com'
        }),
        personFactory.build({
          id: 18,
          first_name: 'jeff'
        }),
        personFactory.build({
          id: 19,
          display_name: 'jeffrey lin'
        }),
        personFactory.build({
          id: 20,
          first_name: 'shining',
          display_name: 'shining ma',
          email: 'shining.mao@ringcentral.com'
        })
      ]);
    });

    it('default keyword to be empty string', async () => {
      await expect(personDao.searchPeopleByKey()).resolves.toEqual([]);
    });

    it('search people with no keywords', async () => {
      await expect(personDao.searchPeopleByKey('  ')).resolves.toEqual([]);
    });
  });

  describe('getAllCount()', () => {
    it('return total', async () => {
      await expect(personDao.getAllCount()).resolves.toEqual(10);
    });
  });
});
