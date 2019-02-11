/// <reference path="../../../__tests__/types.d.ts" />
import { daoManager } from '../../../dao';
import IncomingPostHandler from '../incomingPostHandler';
import { postFactory } from '../../../__tests__/factories';
import { PostDao } from '../../../module/post/dao/PostDao';

jest.mock('../../../dao', () => {
  const methods = {
    queryPostsByGroupId: jest.fn(),
    bulkDelete: jest.fn(),
    queryOldestPostByGroupId: jest.fn(),
    batchGet: jest.fn(),
  };
  return {
    daoManager: {
      getDao: () => methods,
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('handelGroupPostsDiscontinuousCasuedByOverThreshold()', () => {
  it('test empty an array', async () => {
    const result1 = await IncomingPostHandler.handelGroupPostsDiscontinuousCasuedByOverThreshold(
      [],
      true,
    );
    expect(result1).toEqual([]);
  });

  it('test do not delete', async () => {
    const mock = [];
    for (let i = 1; i < 60; i += 1) {
      mock.push({ id: i, group_id: Math.random() > 0.5 ? 1 : 2 });
    }
    daoManager.getDao<PostDao>(null).queryPostsByGroupId.mockResolvedValue([]);
    const result = await IncomingPostHandler.handelGroupPostsDiscontinuousCasuedByOverThreshold(
      mock,
      true,
    );
    expect(result).toEqual(mock);
  });

  it('test should be delete postid === 1', async () => {
    const mock = [];
    for (let i = 1; i < 100; i += 1) {
      mock.push({ id: i, group_id: Math.random() > 0.5 ? 1 : 2 });
    }
    daoManager
      .getDao<PostDao>(null)
      .queryPostsByGroupId.mockResolvedValue([{ id: 1 }]);
    const result = await IncomingPostHandler.handelGroupPostsDiscontinuousCasuedByOverThreshold(
      mock,
      true,
    );
    mock.shift();
    expect(result).toEqual(mock);
  });

  it('test error', async () => {
    const mock = [];
    for (let i = 1; i < 100; i += 1) {
      mock.push({ id: i, group_id: Math.random() > 0.5 ? 1 : 2 });
    }
    daoManager
      .getDao<PostDao>(null)
      .queryPostsByGroupId.mockImplementation(() => {
        throw new Error('error msg');
      });
    const result = await IncomingPostHandler.handelGroupPostsDiscontinuousCasuedByOverThreshold(
      mock,
      true,
    );
    expect(result).toEqual([]);
  });
});

it('isGroupPostsDiscontinuous()', () => {
  const result1 = IncomingPostHandler.isGroupPostsDiscontinuous([
    postFactory.build({
      id: 1,
      group_id: 1,
      created_at: 1,
      modified_at: 1,
    }),
  ]);
  expect(result1).toBe(false);
  const result2 = IncomingPostHandler.isGroupPostsDiscontinuous([
    postFactory.build({
      id: 1,
      group_id: 1,
      created_at: 1,
      modified_at: 2,
    }),
  ]);
  expect(result2).toBe(true);
});

it('removeDiscontinuousPosts()', async () => {
  const mock = {
    1: [
      postFactory.build({
        id: 11,
        group_id: 1,
        created_at: 1,
        modified_at: 1,
      }),
      postFactory.build({
        id: 12,
        group_id: 1,
        created_at: 1,
        modified_at: 2,
      }),
    ],
    2: [
      postFactory.build({
        id: 22,
        group_id: 1,
        created_at: 1,
        modified_at: 2,
      }),
    ],
  };
  daoManager
    .getDao<PostDao>(null)
    .queryOldestPostByGroupId.mockResolvedValueOnce([
      postFactory.build({
        id: 11,
        group_id: 1,
        created_at: 1,
        modified_at: 1,
      }),
    ]);
  await IncomingPostHandler.removeDiscontinuousPosts(mock);
  // TODO figure out why this test don't have any assert
  // expect(result1).toBe(false);
  // const result2 = IncomingPostHandler
  //    .isGroupPostsDiscontinuous([{ created_at: 1, modified_at: 2 }]);
  // expect(result2).toBe(true);
});

it('handleGroupPostsDiscontinuousCausedByModificationTimeChange()', async () => {
  const mock = [
    postFactory.build({
      id: 11,
      group_id: 1,
      created_at: 1,
      modified_at: 1,
    }),
    postFactory.build({
      id: 12,
      group_id: 1,
      created_at: 1,
      modified_at: 2,
    }),
  ];

  const result = await IncomingPostHandler.handleGroupPostsDiscontinuousCausedByModificationTimeChange(
    mock,
  );
  expect(result).toEqual([]);
});

describe('handleEditedPostNoInDB()', () => {
  it('test empty an array', async () => {
    const result = await IncomingPostHandler.handleEditedPostNoInDB([]);
    expect(result).toEqual([]);
  });

  it('test an array', async () => {
    const mock = [
      postFactory.build({
        id: 11,
        group_id: 1,
        created_at: 1,
        modified_at: 1,
      }),
      postFactory.build({
        id: 12,
        group_id: 1,
        created_at: 1,
        modified_at: 2,
      }),
    ];
    daoManager.getDao<PostDao>(null).batchGet.mockResolvedValueOnce(mock);
    const result = await IncomingPostHandler.handleEditedPostNoInDB(mock);
    expect(result).toEqual(mock);
  });

  it('test error', async () => {
    const mock = [
      postFactory.build({
        id: 11,
        group_id: 1,
        created_at: 1,
        modified_at: 1,
      }),
      postFactory.build({
        id: 12,
        group_id: 1,
        created_at: 1,
        modified_at: 2,
      }),
    ];
    daoManager.getDao<PostDao>(null).batchGet.mockImplementation(() => {
      throw new Error('error msg');
    });
    const result = await IncomingPostHandler.handleEditedPostNoInDB(mock);
    expect(result).toEqual([]);
  });
});

it('getDeactivatedPosts()', async () => {
  const mock = [
    postFactory.build({
      id: 11,
      group_id: 1,
      created_at: 1,
      modified_at: 1,
      deactivated: true,
    }),
    postFactory.build({
      id: 12,
      group_id: 1,
      created_at: 1,
      modified_at: 2,
      deactivated: false,
    }),
  ];
  const result = await IncomingPostHandler.getDeactivatedPosts(mock);
  expect(result).toMatchObject([
    {
      id: 11,
      group_id: 1,
      created_at: 1,
      modified_at: 1,
      deactivated: true,
    },
  ]);
});

it('removeDeactivatedPostFromValidPost()', async () => {
  const validPost = [
    postFactory.build({
      id: 11,
      group_id: 1,
      created_at: 1,
      modified_at: 1,
      deactivated: true,
    }),
    postFactory.build({
      id: 12,
      group_id: 1,
      created_at: 1,
      modified_at: 2,
      deactivated: false,
    }),
  ];
  const deactivatedPosts = [
    postFactory.build({
      id: 11,
      group_id: 1,
      created_at: 1,
      modified_at: 1,
      deactivated: true,
    }),
  ];
  const result = await IncomingPostHandler.removeDeactivatedPostFromValidPost(
    validPost,
    deactivatedPosts,
  );
  expect(result).toMatchObject([
    {
      id: 12,
      group_id: 1,
      created_at: 1,
      modified_at: 2,
      deactivated: false,
    },
  ]);
});
