import { ENTITY } from '../eventKey';
import notificationCenter from '../notificationCenter';
import { transform, transformAll, baseHandleData } from '../utils';
import { daoManager } from '../../dao';
import { rawBaseModelFactory } from '../../__tests__/factories';

jest.mock('../notificationCenter');

describe('utils', () => {
  describe('transform()', () => {
    it('should transform object key from _id to id', () => {
      const obj = rawBaseModelFactory.build({ _id: 1 });
      delete obj.id;
      expect(transform(obj)).toMatchObject({ id: 1 });

      // const str = 'STRING';
      // expect(transform(str)).toEqual(str);
    });
  });

  describe('transformAll()', () => {
    it('should transform all object key from obj _id to id', () => {
      const item1 = rawBaseModelFactory.build({ _id: 1 });
      delete item1.id;
      const item2 = rawBaseModelFactory.build({ _id: 2 });
      delete item2.id;
      const arr = [item1, item2];
      expect(transformAll(arr)).toMatchObject([{ id: 1 }, { id: 2 }]);

      const obj = rawBaseModelFactory.build({ _id: 1 });
      delete obj.id;
      expect(transformAll(obj)).toMatchObject([{ id: 1 }]);
    });
  });

  describe('baseHandleData()', () => {
    const fakeDao = {
      bulkPut: jest.fn(),
      bulkDelete: jest.fn(),
    };

    beforeEach(() => {
      fakeDao.bulkPut.mockClear();
      fakeDao.bulkDelete.mockClear();
    });

    it('should put data', async () => {
      const obj = {
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        dao: fakeDao,
        eventKey: ENTITY.POST,
      };

      await baseHandleData(obj);

      expect(fakeDao.bulkPut).toHaveBeenCalledWith([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalled();
    });

    it('should not put data but should notify', async () => {
      const obj = {
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        dao: fakeDao,
        eventKey: ENTITY.POST,
        noSavingToDB: true,
      };

      await baseHandleData(obj);

      expect(fakeDao.bulkPut).not.toHaveBeenCalled();
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalled();
    });

    it('should call bulk put data in entity source controller', async () => {
      const entitySourceController = {
        bulkPut: jest.fn(),
      };
      const obj = {
        entitySourceController,
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        dao: fakeDao,
        eventKey: ENTITY.POST,
        noSavingToDB: false,
      };

      await baseHandleData(obj);

      expect(entitySourceController.bulkPut).toHaveBeenCalledWith(obj.data);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalled();
    });

    it('should update deactivated data', async () => {
      const obj = {
        data: [
          { id: 1, deactivated: true },
          { id: 2, deactivated: true },
          { id: 3, deactivated: true },
        ],
        dao: fakeDao,
        eventKey: ENTITY.POST,
      };
      const deactivatedDao = {
        bulkPut: jest.fn(),
      };
      daoManager.getDao = jest.fn(() => deactivatedDao);
      await baseHandleData(obj);

      expect(deactivatedDao.bulkPut).toHaveBeenCalledWith(obj.data);
      expect(fakeDao.bulkDelete).toHaveBeenCalledWith([1, 2, 3]);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalled();
      expect(notificationCenter.emitEntityDelete).not.toHaveBeenCalled();
    });
  });
});
