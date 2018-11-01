/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-10-31 09:48:15
 * Copyright © RingCentral. All rights reserved.
 */

import Loki from 'lokijs';
import Dexie from 'dexie';

function runQueryExecutorTests({
  setup,
  execQuery,
  extractResultsToIds,
  extractResultsToFirstNames,
  extractResults,
}) {
  describe('execQuery()', () => {
    let arg0: Loki.Collection | Dexie.Table;

    beforeEach(async () => {
      arg0 = await setup();
    });

    describe('without criteria', () => {
      it('should return all data', async () => {
        const results = await execQuery(arg0);

        const ids = await extractResultsToIds(results);

        expect(ids).toEqual([1, 2, 3, 4]);
      });
    });

    describe('reverse', () => {
      it('should reverse the collection', async () => {
        const results = await execQuery(arg0, {
          criteria: [{ name: 'reverse' }],
        });
        const ids = await extractResultsToIds(results);

        expect(ids).toEqual([4, 3, 2, 1]);
      });

      it('should not reverse the collection when applying two reverse', async () => {
        const results = await execQuery(arg0, {
          criteria: [{ name: 'reverse' }, { name: 'reverse' }],
        });

        const result = await extractResultsToIds(results);

        expect(result).toEqual([1, 2, 3, 4]);
      });
    });

    describe('orderBy', () => {
      it('should order by given key', async () => {
        const results = await execQuery(arg0, {
          criteria: [{ name: 'orderBy', key: 'firstName' }],
        });
        const firstNames = await extractResultsToFirstNames(results);
        expect(firstNames).toEqual(['Alvin', 'Baby', 'Baby', 'Cooler']);
      });
      it('should order by given key desc', async () => {
        const results = await execQuery(arg0, {
          criteria: [{ name: 'orderBy', key: 'firstName', desc: true }],
        });
        const firstNames = await extractResultsToFirstNames(results);
        expect(firstNames).toEqual(['Cooler', 'Baby', 'Baby', 'Alvin']);
      });
    });

    describe('anyOf', () => {
      it('should return any of the data that matches given array', async () => {
        const results = await execQuery(arg0, {
          criteria: [
            {
              key: 'firstName',
              name: 'anyOf',
              value: ['Alvin', 'cooler'],
              ignoreCase: true,
            },
          ],
        });
        const firstNames = await extractResultsToFirstNames(results);
        expect(firstNames).toEqual(['Alvin', 'Cooler']);
      });

      it('should return any of the data that matches given array (not ignore case)', async () => {
        const results = await execQuery(arg0, {
          criteria: [
            { key: 'firstName', name: 'anyOf', value: ['Alvin', 'cooler'] },
          ],
        });
        const firstNames = await extractResultsToFirstNames(results);
        expect(firstNames).toEqual(['Alvin']);
      });
    });

    describe('equal', () => {
      it('should return strict matched data', async () => {
        const results = await execQuery(arg0, {
          criteria: [
            {
              key: 'firstName',
              name: 'equal',
              value: 'cooler',
              ignoreCase: true,
            },
          ],
        });
        const firstNames = await extractResultsToFirstNames(results);
        expect(firstNames).toEqual(['Cooler']);
      });

      it('should work with boolean', async () => {
        const results = await execQuery(arg0, {
          criteria: [{ key: 'isVip', name: 'equal', value: true }],
        });
        const ids = await extractResultsToIds(results);
        expect(ids).toEqual([1, 2, 3]);
      });
    });

    describe('notEqual', () => {
      it('should return strict matched data', async () => {
        const results = await execQuery(arg0, {
          criteria: [{ key: 'firstName', name: 'notEqual', value: 'Baby' }],
        });
        const firstNames = await extractResultsToFirstNames(results);
        expect(firstNames).toEqual(['Alvin', 'Cooler']);
      });
    });

    describe('startsWith', () => {
      it('should return strict matched data', async () => {
        const results = await execQuery(arg0, {
          criteria: [
            {
              key: 'firstName',
              name: 'startsWith',
              value: 'C',
              ignoreCase: true,
            },
          ],
        });
        const firstNames = await extractResultsToFirstNames(results);
        expect(firstNames).toEqual(['Cooler']);
      });

      it('should return strict matched data (not ignore case)', async () => {
        const results = await execQuery(arg0, {
          criteria: [{ key: 'firstName', name: 'startsWith', value: 'C' }],
        });
        const firstNames = await extractResultsToFirstNames(results);
        expect(firstNames).toEqual(['Cooler']);
      });
    });

    describe('contains', () => {
      it('should return strict matched data', async () => {
        const results = await execQuery(arg0, {
          criteria: [{ key: 'groups', name: 'contain', value: 1 }],
        });
        const firstNames = await extractResultsToFirstNames(results);
        expect(firstNames).toEqual(['Baby', 'Cooler']);
      });
    });

    describe('filter', () => {
      it('should filter data', async () => {
        const results = await execQuery(arg0, {
          criteria: [{ name: 'filter', filter: obj => obj.id === 1 }],
        });
        const ids = await extractResultsToIds(results);
        expect(ids).toEqual([1]);
      });
    });

    describe('compose', () => {
      it('should filter data', async () => {
        const results = await execQuery(arg0, {
          criteria: [
            { name: 'orderBy', key: 'firstName' },
            { name: 'filter', filter: obj => obj.id === 1 || obj.id === 2 },
          ],
        });
        const ids = await extractResultsToIds(results);
        expect(ids).toEqual([2, 1]);
      });

      it('should return data that matches all the rules', async () => {
        const results = await execQuery(arg0, {
          criteria: [
            { name: 'equal', key: 'firstName', value: 'Baby' },
            { name: 'equal', key: 'lastName', value: 'Lin' },
          ],
        });
        const persons = await extractResults(results);
        expect(persons).toEqual([
          {
            id: 1,
            firstName: 'Baby',
            lastName: 'Lin',
            isVip: true,
            groups: [1],
          },
        ]);
      });
    });

    describe('offset/limit', () => {
      it('should the first two item', async () => {
        const results = await execQuery(arg0, {
          criteria: [{ name: 'limit', value: 2 }],
        });
        const ids = await extractResultsToIds(results);
        expect(ids).toEqual([1, 2]);
      });

      it('should the last two item', async () => {
        const results = await execQuery(arg0, {
          criteria: [{ name: 'offset', value: 2 }],
        });
        const ids = await extractResultsToIds(results);
        expect(ids).toEqual([3, 4]);
      });
    });
  });
}

export { runQueryExecutorTests };
