/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-05-04 18:38:12
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { postFactory, rawPostFactory } from '../../../__tests__/factories';
import { daoManager } from '../../../dao';
import IncomingPostHandler from '../../../service/post/incomingPostHandler';
import { baseHandleData as utilsBaseHandleData, transform } from '../../../service/utils';
import PostService from '../../post';
import GroupService from '../../group';
import handleData, { baseHandleData, handleDataFromSexio, handlePreInstedPosts } from '../handleData';

jest.mock('../../post');
jest.mock('../../group');
const postService = new PostService();
const groupService = new GroupService();
PostService.getInstance = jest.fn().mockReturnValue(postService);
GroupService.getInstance = jest.fn().mockReturnValue(groupService);

jest.mock('../../post/incomingPostHandler', () => ({
  handelGroupPostsDiscontinuousCasuedByOverThreshold: jest.fn(),
  handleGroupPostsDiscontinuousCausedByModificationTimeChange: jest.fn(),
}));

jest.mock('../../utils', () => ({
  transform: jest.fn().mockImplementation(data => data),
  baseHandleData: jest.fn(),
}));

const dao = {
  // db: new noop(),
  getAll: jest.fn().mockReturnValue([{ id: 1 }]),
  purgePostsByGroupId: jest.fn(),
  createQuery: jest.fn(),
  isLokiDB: jest.fn().mockReturnValue(false),
};
beforeAll(() => {
  jest.spyOn(daoManager, 'getStorageQuotaOccupation').mockReturnValue(0.5);
  jest.spyOn(daoManager, 'getDao').mockReturnValue(dao);
});

beforeEach(() => {
  jest.clearAllMocks();
});
describe('Post service handleData', () => {
  it('maxPostsExceed = false', async () => {
    utilsBaseHandleData.mockReturnValue([]);
    daoManager.getDao(null).createQuery.mockImplementation(() => ({
      count: jest.fn().mockReturnValue(300001),
    }));
    jest.spyOn(require('../handleData'), 'handlePreInstedPosts').mockResolvedValueOnce([]);

    await handleData([rawPostFactory.build({ _id: 1 })], false);
    expect(IncomingPostHandler.handelGroupPostsDiscontinuousCasuedByOverThreshold).toHaveBeenCalled();
    expect(IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange).toHaveBeenCalled();
  });

  it('maxPostsExceed = true', async () => {
    daoManager.getDao(null).createQuery.mockImplementation(() => ({
      count: jest.fn().mockReturnValue(299999),
    }));
    utilsBaseHandleData.mockReturnValue([{ group_id: 123 }]);
    await handleData([], true);
  });
});

describe('handleDataFromSexio', () => {
  it('empty array', async () => {
    const ret = await handleDataFromSexio([]);
    expect(ret).toBeUndefined();
    expect(IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange).not.toHaveBeenCalled();
  });

  it('default data', async () => {
    // jest.spyOn(service, 'isVersionInPreInsert').mockReturnValue();
    IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange.mockReturnValue([{}, {}]);
    await handleDataFromSexio([rawPostFactory.build({ _id: 1 })]);
    expect(IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange).toHaveBeenCalled();
    expect(utilsBaseHandleData).toHaveBeenCalled();
  });
  it('default data', async () => {
    IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange.mockReturnValue([]);
    await handleDataFromSexio([rawPostFactory.build({ _id: 1 })]);
    expect(IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange).toHaveBeenCalled();
    expect(utilsBaseHandleData).not.toHaveBeenCalled();
  });
});

describe('baseHandleData', () => {
  beforeEach(() => {});
  it('false', async () => {
    const ret = await baseHandleData([], false);
    expect(ret).toEqual([]);
    expect(transform).toHaveBeenCalledTimes(0);
  });

  it('true', async () => {
    const ret = await baseHandleData([rawPostFactory.build({ _id: 1 }), rawPostFactory.build({ _id: 2 })]);
    expect(ret).toMatchObject([{ _id: 1 }, { _id: 2 }]);
    expect(transform).toHaveBeenCalledTimes(2);
  });
});

describe('handlePreInstedPosts', () => {
  const postDao = {
    bulkDelete: jest.fn(),
  };
  beforeAll(() => {
    jest.restoreAllMocks();
    jest.spyOn(daoManager, 'getDao').mockReturnValue(postDao);
  });
  afterEach(() => {
    jest.clearAllMocks();
    daoManager.getDao.mockReturnValueOnce(postDao);
  });
  it('handlePreInstedPosts should be [] with invalid parameters', async () => {
    const result = await handlePreInstedPosts([]);
    expect(result.length).toBe(0);
  });

  it('handlePreInstedPosts should be [] with valid parameter', async () => {
    const result = await handlePreInstedPosts([
      postFactory.build({
        id: 1,
        version: 100,
        modified_at: 101,
        created_at: 101,
        creator_id: 101,
        group_id: 101,
        text: '',
      }),
    ]);
    expect(result.length).toBe(0);
  });

  it('handlePreInstedPosts should be [1] with valid parameter', async () => {
    postService.isVersionInPreInsert.mockResolvedValueOnce({
      existed: true,
      id: -100,
    });
    const result = await handlePreInstedPosts([
      postFactory.build({
        id: 1,
        version: 100,
        modified_at: 101,
        created_at: 101,
        creator_id: 101,
        group_id: 101,
        text: '',
      }),
    ]);

    expect(result[0]).toBe(-100);
  });
});
