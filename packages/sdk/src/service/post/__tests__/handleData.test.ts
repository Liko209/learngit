/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-05-04 18:38:12
 * Copyright © RingCentral. All rights reserved.
 */
/// <reference path="../../../__tests__/types.d.ts" />
import { rawPostFactory } from '../../../__tests__/factories';
import { daoManager } from '../../../dao';
import {
  baseHandleData as utilsBaseHandleData,
  transform,
} from '../../../service/utils';
import PostService from '../../post';
import GroupService from '../../group';
import { baseHandleData } from '../handleData';

jest.mock('../../post');
jest.mock('../../group');
const postService = new PostService();
const groupService = new GroupService();
PostService.getInstance = jest.fn().mockReturnValue(postService);
GroupService.getInstance = jest.fn().mockReturnValue(groupService);

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
