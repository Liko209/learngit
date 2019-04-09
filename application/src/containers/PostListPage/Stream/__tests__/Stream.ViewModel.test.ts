/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-12 20:31:07
 * Copyright © RingCentral. All rights reserved.
 */
import { StreamViewModel } from '../Stream.ViewModel';
import { POST_LIST_TYPE } from '../../types';
import { QUERY_DIRECTION } from 'sdk/dao';
import storeManager from '@/store';
import * as _ from 'lodash';
import * as utils from '@/store/utils';
import { PostService } from 'sdk/module/post';
import { notificationCenter, ENTITY } from 'sdk/service';

jest.mock('sdk/module/post');

function setup(obj: any) {
  const vm = new StreamViewModel();
  vm.props.type = POST_LIST_TYPE.mentions;
  vm.props.postIds = [1];
  vm._postIds = [1, 2, 3];
  Object.assign(vm, obj);
  return vm;
}

const postService = new PostService();

describe('StreamViewModel', () => {
  let mockedSortableListHandler: any;
  let oldProps: any;
  let vm: any;
  let newProps: any;
  beforeEach(() => {
    PostService.getInstance = jest.fn().mockReturnValue(postService);
    mockedSortableListHandler = {
      sortableListStore: {
        getIds: jest.fn().mockReturnValue([1, 2, 3]),
        clear: jest.fn(),
        removeByIds: jest.fn(),
      },
      fetchData: jest.fn(),
      onDataChanged: jest.fn(),
      hasMore: jest.fn().mockReturnValue(true),
      setHasMore: jest.fn(),
    };
    oldProps = {
      _sortableListHandler: mockedSortableListHandler,
    };
    newProps = {
      postIds: [1, 2],
    };
    vm = setup(oldProps);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should add new post if the postIds added', async () => {
    const localProps = { ...newProps };
    postService.getPostsByIds.mockResolvedValue({
      posts: [
        {
          id: 1,
        },
      ],
    });
    vm._postIds = [1];
    await vm.onReceiveProps(localProps);
    const returnedEntity = new Map();
    returnedEntity.set(1, expect.objectContaining({ id: 1 }));
    expect(mockedSortableListHandler.onDataChanged).toBeCalledWith({
      body: {
        entities: returnedEntity,
        ids: [2],
      },
      type: 'update',
    });
  });
  it('should delete post if the postIds shortened', async () => {
    const localProps = { ...newProps };
    postService.getPostsByIds.mockResolvedValue({
      posts: [],
    });
    vm._postIds = [1, 2, 3];
    await vm.onReceiveProps(localProps);
    expect(mockedSortableListHandler.onDataChanged).toBeCalledWith({
      body: {
        ids: [3],
      },
      type: 'delete',
    });
  });
  it('should fetch initial data if the postIds added while the previous postIds is empty', async () => {
    const localProps = { ...newProps };
    postService.getPostsByIds.mockResolvedValue({
      posts: [
        {
          id: 1,
        },
      ],
    });
    vm._postIds = [];
    await vm.onReceiveProps(localProps);
    expect(mockedSortableListHandler.fetchData).toBeCalledWith(
      QUERY_DIRECTION.NEWER,
    );
    expect(vm._postIds).toEqual([1, 2]);
  });
});

describe('Posts order', () => {
  afterEach(() => {
    notificationCenter.removeAllListeners();
  });
  it('should have _index as sortValue when handle data change', () => {
    jest.spyOn(utils, 'transform2Map').mockImplementation(a => a);
    const vm = new StreamViewModel();
    vm._postIds = [4, 1, 2, 5];
    jest
      .spyOn(vm._sortableListHandler, 'onDataChanged')
      .mockImplementationOnce(() => {});
    notificationCenter.emitEntityUpdate(`${ENTITY.POST}.*`, [
      { id: 1 },
      { id: 2 },
      { id: 4 },
      { id: 5 },
    ]);
    expect(vm._sortableListHandler.onDataChanged).toHaveBeenCalledWith({
      body: {
        ids: [1, 2, 4, 5],
        entities: [
          { _index: 1, id: 1 },
          { _index: 2, id: 2 },
          { _index: 0, id: 4 },
          { _index: 3, id: 5 },
        ],
      },
      type: 'update',
    });
  });
});
