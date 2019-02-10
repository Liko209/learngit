/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-05-04 18:38:12
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { postFactory, rawPostFactory } from '../../../__tests__/factories';
import { daoManager } from '../../../dao';
import IncomingPostHandler from '../../../service/post/incomingPostHandler';
import {
  baseHandleData as utilsBaseHandleData,
  transform,
} from '../../../service/utils';
import PostService from '../../post';
import GroupService from '../../../module/group';
import { PostDao } from '../../../module/post/dao/PostDao';
import handleData, {
  baseHandleData,
  handleDataFromSexio,
  handlePreInsertPosts,
} from '../handleData';

jest.mock('../../post');
// jest.mock('../../group');
jest.mock('sdk/module/group');
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
  get: jest.fn(),
  getAll: jest.fn().mockReturnValue([{ id: 1 }]),
  bulkDelete: jest.fn(),
  bulkPut: jest.fn(),
  createQuery: jest.fn(),
  queryOldestPostByGroupId: jest.fn(),
  queryLastPostByGroupId: jest.fn(),
  savePostView: jest.fn(),
};
beforeAll(() => {
  jest.spyOn(daoManager, 'getStorageQuotaOccupation').mockReturnValue(0.5);
  jest.spyOn(daoManager, 'getDao').mockReturnValue(dao);
  jest.spyOn(groupService, 'getById').mockResolvedValue({
    most_recent_post_id: 123,
  });
  utilsBaseHandleData.mockReturnValue([]);
});

beforeEach(() => {
  jest.clearAllMocks();
});
describe('Post service handleData', () => {
  it('maxPostsExceed = false', async () => {
    utilsBaseHandleData.mockReturnValue([]);
    daoManager.getDao(PostDao).createQuery.mockImplementation(() => ({
      count: jest.fn().mockReturnValue(300001),
    }));
    jest
      .spyOn(require('../handleData'), 'handlePreInsertPosts')
      .mockResolvedValueOnce([]);

    await handleData([rawPostFactory.build({ _id: 1 })], false);
    expect(
      IncomingPostHandler.handelGroupPostsDiscontinuousCasuedByOverThreshold,
    ).toHaveBeenCalled();
    expect(
      IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange,
    ).toHaveBeenCalled();
  });

  it('maxPostsExceed = true', async () => {
    daoManager.getDao(PostDao).createQuery.mockImplementation(() => ({
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
    expect(
      IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange,
    ).not.toHaveBeenCalled();
  });

  it('default data', async () => {
    // jest.spyOn(service, 'isVersionInPreInsert').mockReturnValue();
    IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange.mockReturnValue(
      [{}, {}],
    );
    await handleDataFromSexio([rawPostFactory.build({ _id: 1 })]);
    expect(
      IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange,
    ).toHaveBeenCalled();
    expect(utilsBaseHandleData).toHaveBeenCalled();
  });
  it('default data', async () => {
    IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange.mockReturnValue(
      [],
    );
    await handleDataFromSexio([rawPostFactory.build({ _id: 1 })]);
    expect(
      IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange,
    ).toHaveBeenCalled();
    expect(utilsBaseHandleData).not.toHaveBeenCalled();
  });
});

describe('baseHandleData', () => {
  beforeEach(() => {});
  it('true', async () => {
    const ret = await baseHandleData(
      [rawPostFactory.build({ _id: 1 }), rawPostFactory.build({ _id: 2 })],
      true,
    );
    expect(ret).toMatchObject([{ _id: 1 }, { _id: 2 }]);
    expect(transform).toHaveBeenCalledTimes(2);
  });
});

describe('handlePreInsertedPosts', () => {
  it('handlePreInsertedPosts should be [] with invalid parameters', async () => {
    const result = await handlePreInsertPosts([]);
    expect(result.length).toBe(0);
  });

  it('handlePreInsertedPosts should be [] with valid parameter', async () => {
    const result = await handlePreInsertPosts([
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

  it('handlePreInsertedPosts should be [1] with valid parameter', async () => {
    const result = await handlePreInsertPosts([
      postFactory.build({
        id: -1,
        version: 100,
        modified_at: 101,
        created_at: 101,
        creator_id: 101,
        group_id: 101,
        text: '',
      }),
    ]);

    expect(result[0]).toBe(100);
  });
});

describe('Whether to save to db detection', () => {
  it('should not save if incoming post is not self continuous', async () => {
    dao.queryOldestPostByGroupId.mockReturnValue({ created_at: 10 });
    dao.queryLastPostByGroupId.mockReturnValue({ created_at: 100 });
    const posts = [
      rawPostFactory.build({ created_at: 1 }),
      rawPostFactory.build({ created_at: 2 }),
      rawPostFactory.build({ created_at: 3 }),
      rawPostFactory.build({ created_at: 4 }),
    ];
    await baseHandleData(posts, false);
    expect(utilsBaseHandleData.mock.calls[0][0]).toMatchObject({
      noSavingToDB: true,
    });
  });
  it('should not save if latest of the posts is older than the oldest in db', async () => {
    dao.queryOldestPostByGroupId.mockReturnValue({ created_at: 10 });
    dao.queryLastPostByGroupId.mockReturnValue({ created_at: 100 });
    const posts = [rawPostFactory.build({ created_at: 1 })];
    await baseHandleData(posts);
    expect(utilsBaseHandleData.mock.calls[0][0]).toMatchObject({
      noSavingToDB: true,
    });
  });

  it('should not save if latest of the posts is older than the oldest in db', async () => {
    dao.queryOldestPostByGroupId.mockReturnValue({ created_at: 10 });
    dao.queryLastPostByGroupId.mockReturnValue({ created_at: 100 });
    const posts = [
      rawPostFactory.build({ created_at: 1 }),
      rawPostFactory.build({ created_at: 2 }),
      rawPostFactory.build({ created_at: 3 }),
      rawPostFactory.build({ created_at: 4 }),
    ];
    await baseHandleData(posts);
    expect(utilsBaseHandleData.mock.calls[0][0]).toMatchObject({
      noSavingToDB: true,
    });
  });

  it('should save if latest of the posts is not older than the oldest in db', async () => {
    dao.queryOldestPostByGroupId.mockReturnValue({ created_at: 10 });
    dao.queryLastPostByGroupId.mockReturnValue({ created_at: 100 });
    const posts = [
      rawPostFactory.build({ created_at: 9 }),
      rawPostFactory.build({ created_at: 10 }),
      rawPostFactory.build({ created_at: 11 }),
      rawPostFactory.build({ created_at: 12 }),
      rawPostFactory.build({ created_at: 13 }),
    ];
    await baseHandleData(posts);
    expect(utilsBaseHandleData.mock.calls[0][0]).toMatchObject({
      noSavingToDB: false,
    });
  });

  it('should save if oldest of the posts is newer than the latest in db', async () => {
    dao.queryOldestPostByGroupId.mockReturnValue({ created_at: 10 });
    dao.queryLastPostByGroupId.mockReturnValue({ created_at: 100 });
    const posts = [
      rawPostFactory.build({ created_at: 101 }),
      rawPostFactory.build({ created_at: 102 }),
      rawPostFactory.build({ created_at: 103 }),
      rawPostFactory.build({ created_at: 104 }),
      rawPostFactory.build({ created_at: 105 }),
    ];
    await baseHandleData(posts);
    expect(utilsBaseHandleData.mock.calls[0][0]).toMatchObject({
      noSavingToDB: false,
    });
  });

  it('should save if oldest of the posts is newer than the latest in db', async () => {
    dao.queryOldestPostByGroupId.mockReturnValue({ created_at: 10 });
    dao.queryLastPostByGroupId.mockReturnValue({ created_at: 100 });
    const posts = [rawPostFactory.build({ created_at: 101 })];
    await baseHandleData(posts);
    expect(utilsBaseHandleData.mock.calls[0][0]).toMatchObject({
      noSavingToDB: false,
    });
  });

  it('should save if oldest of the posts is not newer than the latest in db', async () => {
    dao.queryOldestPostByGroupId.mockReturnValue({ created_at: 10 });
    dao.queryLastPostByGroupId.mockReturnValue({ created_at: 100 });
    const posts = [
      rawPostFactory.build({ created_at: 99 }),
      rawPostFactory.build({ created_at: 100 }),
      rawPostFactory.build({ created_at: 101 }),
      rawPostFactory.build({ created_at: 102 }),
      rawPostFactory.build({ created_at: 103 }),
    ];
    await baseHandleData(posts);
    expect(utilsBaseHandleData.mock.calls[0][0]).toMatchObject({
      noSavingToDB: false,
    });
  });

  it('should save if explicitly specified', async () => {
    const posts = [
      rawPostFactory.build({ created_at: 99 }),
      rawPostFactory.build({ created_at: 100 }),
    ];
    await baseHandleData(posts, true);
    expect(utilsBaseHandleData.mock.calls[0][0]).toMatchObject({
      noSavingToDB: false,
    });
  });

  it('should not save if explicitly specified', async () => {
    const posts = [
      rawPostFactory.build({ created_at: 99 }),
      rawPostFactory.build({ created_at: 100 }),
    ];
    await baseHandleData(posts, false);
    expect(utilsBaseHandleData.mock.calls[0][0]).toMatchObject({
      noSavingToDB: true,
    });
  });
});
