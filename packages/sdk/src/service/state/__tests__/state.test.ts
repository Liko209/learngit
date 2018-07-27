/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-03-07 09:04:06
 */
/// <reference path="../../../__tests__/types.d.ts" />

import StateService from '..';
import { daoManager, StateDao, GroupStateDao } from '../../../dao';
import PostService from '../../post';
import StateAPI from '../../../api/glip/state';

jest.mock('../../../dao');
jest.mock('../../post');
jest.mock('../../../api/glip/state');

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

      expect(StateAPI.saveStatePartial).toHaveBeenCalledWith(1, {
        'marked_as_unread:1': false,
        'read_through:1': 1,
        'unread_count:1': 0,
        'unread_mentions_count:1': 0
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

      expect(StateAPI.saveStatePartial).toHaveBeenCalledWith(1, { last_group_id: 1, 'last_read_through:1': 1 });
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
});
