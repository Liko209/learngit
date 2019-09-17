/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-12 20:31:07
 * Copyright © RingCentral. All rights reserved.
 */
import { StreamViewModel } from '../Stream.ViewModel';
import { POST_LIST_TYPE } from '../../types';
import { QUERY_DIRECTION } from 'sdk/dao';
import * as _ from 'lodash';
import * as utils from '@/store/utils';
import { PostService } from 'sdk/module/post';
import { notificationCenter, ENTITY } from 'sdk/service';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { transform2Map } from '@/store/utils';

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
    ServiceLoader.getInstance = jest.fn().mockReturnValue(postService);
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
          id: 2,
        },
      ],
    });
    vm._postIds = [1];
    await vm.onReceiveProps(localProps);
    const returnedEntity = new Map();
    returnedEntity.set(2, expect.objectContaining({ id: 2 }));
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
  it('should use _fetchInitialPosts if the postIds added while the previous postIds is empty', async () => {
    expect(vm.fetchInitialPosts).not.toBe(vm._fetchInitialPosts);
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
    expect(vm.fetchInitialPosts).toBe(vm._fetchInitialPosts);
    expect(vm._postIds).toEqual([1, 2]);
  });

  describe('shouldShowErrorPage', () => {
    it('should be false when fetching post succeed at first page', async () => {
      const vm = new StreamViewModel();
      (vm.props.postFetcher = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ data: [], hasMore: true }),
        )),
        expect(vm.shouldShowErrorPage).toBeFalsy();
      await vm._postProvider.fetchData();
      expect(vm.shouldShowErrorPage).toBeFalsy();
    });
    it('should be true when fetchData fail on first page', async () => {
      const vm = new StreamViewModel();
      (vm.props.postFetcher = jest.fn().mockImplementation(() => {
        throw new Error('error');
      })),
        expect(vm.shouldShowErrorPage).toBeFalsy();
      await vm._postProvider.fetchData();
      expect(vm.shouldShowErrorPage).toBeTruthy();
    });
    it('should be false when fetchData fail on second page', async () => {
      const vm = new StreamViewModel();
      let i = 0;
      (vm.props.postFetcher = jest.fn().mockImplementation(() => {
        if (!i) {
          i++;
          vm._initial = false;
          return Promise.resolve({ data: [], hasMore: true });
        } else {
          throw new Error('error');
        }
      })),
        expect(vm.shouldShowErrorPage).toBeFalsy();
      await vm._postProvider.fetchData();
      await vm._postProvider.fetchData();
      expect(vm.shouldShowErrorPage).toBeFalsy();
    });
  });

  describe('tryAgain()', () => {
    it('should reset _initial to true and shouldShowErrorPage to false when being called', () => {
      const vm = new StreamViewModel();
      vm._initial = false;
      vm.shouldShowErrorPage = true;
      vm.tryAgain();
      expect(vm._initial).toBeTruthy();
      expect(vm.shouldShowErrorPage).toBeFalsy();
    });
  });
});

describe('Posts order', () => {
  afterEach(() => {
    notificationCenter.removeAllListeners();
  });
  it('should have _index as sortValue when handle data change', () => {
    const vm = new StreamViewModel();
    vm._postIds = [4, 1, 2, 5];
    jest
      .spyOn(vm._sortableListHandler, 'onDataChanged')
      .mockImplementationOnce(() => {});
    const entities = [{ id: 1 }, { id: 2 }, { id: 4 }, { id: 5 }];
    notificationCenter.emitEntityUpdate(`${ENTITY.POST}.*`, entities);
    expect(vm._sortableListHandler.onDataChanged).toHaveBeenCalledWith({
      body: {
        ids: [1, 2, 4, 5],
        entities: transform2Map(entities),
      },
      type: 'update',
    });
  });
});
