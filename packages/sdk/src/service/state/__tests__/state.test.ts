/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-07 09:04:06
 */
/// <reference path="../../../__tests__/types.d.ts" />

import StateService from '..';
import { daoManager, StateDao, GroupStateDao } from '../../../dao';
import PostService from '../../post';
import StateAPI from '../../../api/glip/state';
import {
  groupState1,
  groupStateResult1,
  groupState2,
  groupStateResult2,
  originState,
  groupState3,
  groupStateResult3,
  groupStateResultNoOrigin3,
  groupState4,
  groupState5,
  groupStateResult5,
  groupState6,
  groupStateResult6,
  groupState7,
  groupStateResult7,
  groupState8,
  groupStateResult8,
  groupState9,
  groupState10,
} from './dummy';
import notificationCenter from '../../../service/notificationCenter';

jest.mock('../../../dao');
jest.mock('../../post');
jest.mock('../../../api/glip/state');
jest.mock('../../../service/notificationCenter', () => ({
  emitEntityUpdate: jest.fn(),
  emitEntityPut: jest.fn(),
}));
describe('StateService', () => {
  const stateService: StateService = new StateService();

  const postService = new PostService();
  const groupStateDao = new GroupStateDao(null);
  const stateDao = new StateDao(null);
  PostService.getInstance = jest.fn().mockReturnValue(postService);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getById()', () => {
    beforeEach(() => {
      daoManager.getDao.mockReturnValueOnce(groupStateDao);
    });

    it('should return groupState', async () => {
      groupStateDao.get.mockResolvedValueOnce({ data: 'test' });
      const resp = await stateService.getById(1);
      expect(resp).toEqual({ data: 'test' });
    });
  });

  describe('updateState()', () => {
    beforeEach(() => {
      daoManager.getDao.mockImplementation(arg => {
        if (arg === GroupStateDao) {
          return groupStateDao;
        }
        if (arg === StateDao) {
          return stateDao;
        }
      });
    });

    it('should call dependencies', async () => {
      await stateService.updateState(12, () => ({}));
      expect(postService.getLastPostOfGroup).toHaveBeenCalledTimes(1);
      expect(stateDao.getFirst).toHaveBeenCalledTimes(1);
      expect(groupStateDao.get).toHaveBeenCalledTimes(1);
      expect(StateAPI.saveStatePartial).toHaveBeenCalledTimes(0);
    });

    it('should not call api if local groupState not found', async () => {
      postService.getLastPostOfGroup.mockResolvedValueOnce({});
      stateDao.getFirst.mockResolvedValueOnce({});
      groupStateDao.get.mockReturnValue(null);
      await stateService.updateState(12, () => ({}));
      expect(StateAPI.saveStatePartial).toHaveBeenCalledTimes(0);
    });

    it('should not call api if local groupState do not have unread_count', async () => {
      postService.getLastPostOfGroup.mockResolvedValueOnce({});
      stateDao.getFirst.mockResolvedValueOnce({});
      groupStateDao.get.mockReturnValue({});
      await stateService.updateState(12, () => ({}));
      expect(StateAPI.saveStatePartial).toHaveBeenCalledTimes(0);

      groupStateDao.get.mockReturnValue({ unread_count: 0 });
      await stateService.updateState(12, () => ({}));
      expect(StateAPI.saveStatePartial).toHaveBeenCalledTimes(0);
    });

    it('should call api if conditions meet', async () => {
      postService.getLastPostOfGroup.mockResolvedValueOnce({});
      stateDao.getFirst.mockResolvedValueOnce({});
      groupStateDao.get.mockReturnValue({ unread_count: 1 });
      await stateService.updateState(12, () => ({}));
      expect(StateAPI.saveStatePartial).toHaveBeenCalledTimes(1);
    });
  });

  describe('markAsRead()', () => {
    beforeAll(() => {
      jest.spyOn(stateService, 'getMyState');
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should call StateAPI.saveStatePartial()', async () => {
      postService.getLastPostOfGroup.mockResolvedValueOnce({ id: 1 });
      stateService.getMyState.mockResolvedValueOnce({ id: 1 });

      await stateService.markAsRead(1);
      expect(notificationCenter.emitEntityUpdate).toBeCalled();

      expect(StateAPI.saveStatePartial).toHaveBeenCalledWith(1, {
        'marked_as_unread:1': false,
        'read_through:1': 1,
        'unread_count:1': 0,
        'unread_deactivated_count:1': 0,
        'unread_mentions_count:1': 0,
      });
    });
  });

  describe('updateLastGroup()', () => {
    beforeAll(() => {
      jest.spyOn(stateService, 'getMyState');
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should call StateAPI.saveStatePartial()', async () => {
      postService.getLastPostOfGroup.mockResolvedValue({ id: 1 });
      stateService.getMyState.mockResolvedValueOnce({ id: 1 });

      await stateService.updateLastGroup(1);

      expect(StateAPI.saveStatePartial).toHaveBeenCalledWith(1, {
        last_group_id: 1,
      });
    });
  });

  describe('getMyState()', () => {
    beforeEach(() => {
      daoManager.getDao.mockReturnValueOnce(stateDao);
    });

    it('should get my state from StateDao', async () => {
      stateDao.getFirst.mockResolvedValueOnce({ data: 'test' });
      const resp = await stateService.getMyState();
      expect(resp).toEqual({ data: 'test' });
    });
  });

  describe('getAllGroupStatesFromLocal()', () => {
    it('should return all data from GroupStateDao', async () => {
      daoManager.getDao.mockReturnValueOnce(groupStateDao);
      groupStateDao.getAll.mockReturnValueOnce([{ data: 'test' }]);

      const resp = await stateService.getAllGroupStatesFromLocal();

      expect(resp).toEqual([{ data: 'test' }]);
    });
  });

  describe('calculateUMI', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should return empty', async () => {
      stateService.getByIdFromDao = jest.fn().mockReturnValue(originState());
      const resp = await stateService.calculateUMI([]);
      expect(resp).toEqual([]);
    });

    it('should calculate state cursor change UMI', async () => {
      stateService.getByIdFromDao = jest.fn().mockReturnValue(originState());
      const resp = await stateService.calculateUMI([groupState1]);
      expect(resp).toEqual([groupStateResult1]);
    });

    it('should calculate group cursor change UMI: case 1', async () => {
      stateService.getByIdFromDao = jest.fn().mockReturnValue(originState());
      const resp = await stateService.calculateUMI([groupState2]);
      expect(resp).toEqual([groupStateResult2]);
    });

    it('should calculate group cursor change UMI: case 2', async () => {
      stateService.getByIdFromDao = jest.fn().mockReturnValue(originState());
      const resp = await stateService.calculateUMI([groupState3]);
      expect(resp).toEqual([groupStateResult3]);
    });

    it('should not calculate group cursor change UMI: case 3', async () => {
      stateService.getByIdFromDao = jest.fn().mockReturnValue(originState());
      const resp = await stateService.calculateUMI([groupState5]);
      expect(resp).toEqual([groupStateResult5]);
    });
    it('should not calculate group cursor change UMI: case 4', async () => {
      stateService.getByIdFromDao = jest.fn().mockReturnValue(originState());
      const resp = await stateService.calculateUMI([groupState6]);
      expect(resp).toEqual([groupStateResult6]);
    });

    it('should calculate group cursor change UMI when origin state not exist', async () => {
      stateService.getByIdFromDao = jest.fn().mockReturnValue(null);
      const resp = await stateService.calculateUMI([groupState3]);
      expect(resp).toEqual([groupStateResultNoOrigin3]);
    });

    it('should not calculate UMI when group cursor decrease', async () => {
      stateService.getByIdFromDao = jest.fn().mockReturnValue(originState());
      const resp = await stateService.calculateUMI([groupState4]);
      expect(resp).toEqual([]);
    });

    it('should not calculate UMI when group cursor decrease : case 2', async () => {
      stateService.getByIdFromDao = jest.fn().mockReturnValue(originState());
      const resp = await stateService.calculateUMI([groupState10]);
      expect(resp).toEqual([]);
    });

    it('should calculate UMI when state cursor decrease and mark as unread', async () => {
      stateService.getByIdFromDao = jest.fn().mockReturnValue(originState());
      const resp = await stateService.calculateUMI([groupState7]);
      expect(resp).toEqual([groupStateResult7]);
    });

    it('should calculate UMI when unread_deactivated_count change', async () => {
      stateService.getByIdFromDao = jest.fn().mockReturnValue(originState());
      const resp = await stateService.calculateUMI([groupState8]);
      expect(resp).toEqual([groupStateResult8]);
    });
    it('should not calculate UMI when state cursor decrease and not mark as unread', async () => {
      stateService.getByIdFromDao = jest.fn().mockReturnValue(originState());
      const resp = await stateService.calculateUMI([groupState9]);
      expect(resp).toEqual([]);
    });
  });
});
