/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-12 20:31:07
 * @Last Modified by: Chris Zhan (chris.zhan@ringcentral.com)
 * @Last Modified time: 2018-11-26 22:59:09
 */
import { StreamViewModel } from '../Stream.ViewModel';
import { POST_LIST_TYPE } from '../../types';
import { service } from 'sdk';
import { QUERY_DIRECTION } from 'sdk/src/dao/constants';
const { PostService } = service;
function setup(obj: any) {
  const vm = new StreamViewModel();
  vm.props.type = POST_LIST_TYPE.mentions;
  vm.props.postIds = [1];
  vm._postIds = [1, 2, 3];
  Object.assign(vm, obj);
  return vm;
}

const postService = {
  getPostsByIds: jest.fn(),
};

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
    returnedEntity.set(1, { id: 1 });
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
    expect(vm._postIds).toEqual([2, 1]);
  });
});
