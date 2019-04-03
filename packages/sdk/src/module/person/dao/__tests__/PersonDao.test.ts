/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-24 00:04:37
 */
import { PersonDao } from '../PersonDao';
import { setup } from '../../../../dao/__tests__/utils';
import _ from 'lodash';
import { Person } from '../../entity';
import { personFactory } from '../../../../__tests__/factories';
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
        deactivated: false,
      },
      {
        id: 2,
        created_at: 12,
        creator_id: 2335,
        first_name: 'Alvin',
        last_name: 'Mao',
        display_name: 'Alvin Mao',
        email: 'alvin.mao@ringcentral.com',
        deactivated: false,
      },
      {
        id: 3,
        created_at: 12,
        creator_id: 2335,
        first_name: 'Albert',
        last_name: 'Chen',
        display_name: 'Albert Chen',
        email: 'albert.chen@ringcentral.com',
        deactivated: false,
      },
      {
        id: 4,
        created_at: 12,
        creator_id: 2335,
        first_name: 'Devin',
        last_name: 'Lin',
        display_name: 'Devin Lin',
        email: 'devin.lin@ringcentral.com',
        deactivated: false,
      },
      {
        id: 5,
        created_at: 12,
        creator_id: 2335,
        first_name: 'Boy',
        last_name: 'lin',
        display_name: 'boy lin',
        email: 'boy.lin@ringcentral.com',
        deactivated: false,
      },
      {
        id: 6,
        created_at: 12,
        creator_id: 2335,
        first_name: 'Lip',
        last_name: 'Wang',
        display_name: 'Lip Wang',
        email: 'lip.wang@ringcentral.com',
        deactivated: false,
      },
      {
        id: 7,
        created_at: 12,
        creator_id: 2335,
        first_name: '--',
        last_name: '---',
        display_name: '-----tester',
        email: 'test1@ringcentral.com',
        deactivated: false,
      },
      {
        id: 8,
        created_at: 12,
        creator_id: 2335,
        first_name: 'first_name',
        display_name: 'I have no last_name',
        email: 'god@ringcentral.com',
      },
      {
        id: 9,
        created_at: 12,
        creator_id: 2335,
        first_name: 'first_name',
        email: 'god@ringcentral.com',
      },
      {
        id: 10,
        created_at: 12,
        creator_id: 2335,
        email: '123god@ringcentral.com',
      },
    ];
    await personDao.bulkPut(mockData);
  });

  it('Save items', async () => {
    const person: Person = personFactory.build({
      id: 100,
      email: 'steve.chen@ringcentral.com',
    });
    await personDao.put(person);
    const matchedPerson = await personDao.get(100);
    expect(matchedPerson).toMatchObject(person);
  });

  describe('getAll()', () => {
    it('should order by display_name', async () => {
      const all = await personDao.getAll();
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
        'Lip Wang',
      ]);
    });
  });

  describe('searchPeopleByKey()', () => {
    describe('when keyword has one part', () => {
      it('should return matched person', async () => {
        const persons = await personDao.searchPeopleByKey('li');
        expect(_.map(persons, 'display_name')).toEqual(['Lip Wang']);
      });

      it('should return [] when search an empty string', async () => {
        const persons = await personDao.searchPeopleByKey(' ');
        expect(persons).toEqual([]);
      });

      it('should return [] when no keyword', async () => {
        const persons = await personDao.searchPeopleByKey();
        expect(persons).toEqual([]);
      });
    });

    describe('when keyword has multi parts', () => {
      it('should work', async () => {
        const persons = await personDao.searchPeopleByKey('albert c');
        expect(_.map(persons, 'display_name')).toEqual(['Albert Chen']);
      });

      it('should not match when first_name matched but person has not last_name', async () => {
        const persons = await personDao.searchPeopleByKey('first_name a');
        expect(persons).toEqual([]);
      });

      it('should not match when display_name matched but person has not last_name', async () => {
        const persons = await personDao.searchPeopleByKey(
          'I have no last_name',
        );
        expect(persons).toEqual([]);
      });
    });
  });

  describe('searchPeopleByKey()', () => {
    beforeAll(async () => {
      await personDao.bulkPut([
        personFactory.build({
          id: 11,
          first_name: 'steve',
          last_name: 'chen',
          email: 'steve.chen@ringcentral.com',
        }),
        personFactory.build({
          id: 12,
          first_name: 'shining',
          last_name: 'mao',
          display_name: 'shining mao',
          email: 'shining.mao@ringcentral.com',
        }),
        personFactory.build({
          id: 13,
          first_name: 'lip',
          last_name: 'wang',
          email: 'lip.wang@ringcentral.com',
        }),
        personFactory.build({
          id: 15,
          first_name: 'devin',
          last_name: 'lin',
          email: 'devin.lin@ringcentral.com',
        }),
        personFactory.build({
          id: 16,
          first_name: 'jeffrey',
          last_name: 'lin',
          email: 'jeffrey.lin@ringcentral.com',
        }),
        personFactory.build({
          id: 17,
          display_name: 'lip wang',
          email: 'lip.wang@ringcentral.com',
        }),
        personFactory.build({
          id: 18,
          first_name: 'jeff',
        }),
        personFactory.build({
          id: 19,
          display_name: 'jeffrey lin',
        }),
        personFactory.build({
          id: 20,
          first_name: 'shining',
          display_name: 'shining ma',
          email: 'shining.mao@ringcentral.com',
        }),
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

  describe('getPersonsByIds', () => {
    it('should get all not deactivated person in the id list', async () => {
      await personDao.bulkPut([
        personFactory.build({
          id: 21,
          first_name: 'thomas',
          last_name: 'yang',
          email: 'thomas.yang@ringcentral.com',
          deactivated: true,
        }),
      ]);
      const ids = [1, 3, 5, 7, 21];
      const expectIds = [1, 3, 5, 7];
      const res = await personDao.getPersonsByIds(ids);
      expect(res).toHaveLength(expectIds.length);
      const resIds: number[] = [];
      res.forEach((element: Person) => {
        resIds.push(element.id);
      });

      expect(resIds.sort()).toEqual(expectIds.sort());
    });
  });
});
