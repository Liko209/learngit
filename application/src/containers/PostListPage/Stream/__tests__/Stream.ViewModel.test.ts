/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-12 20:31:07
 * @Last Modified by: Chris Zhan (chris.zhan@ringcentral.com)
 * @Last Modified time: 2018-11-13 10:01:37
 */
import { StreamViewModel } from '../Stream.ViewModel';
import { POST_LIST_TYPE } from '../../types';
import { service } from 'sdk';
import { transform2Map } from '@/store/utils';
import { notificationCenter } from 'sdk/service';
const { ENTITY, EVENT_TYPES, PostService } = service;
function setup(obj: any) {
  const vm = new StreamViewModel();
  vm.props.type = POST_LIST_TYPE.mentions;
  vm.props.postIds = [1];
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
      onDataChanged: jest.fn(),
    };
    oldProps = {
      _sortableListHandler: mockedSortableListHandler,
    };
    newProps = {
      type: POST_LIST_TYPE.bookmarks,
      postIds: [1, 2],
    };
    vm = setup(oldProps);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('should reset the store if the router changed', () => {
    vm.onReceiveProps(newProps);
    expect(mockedSortableListHandler.sortableListStore.clear).toBeCalled();
  });

  it('should add new post if the postIds added', async () => {
    const localProps = { ...newProps, type: POST_LIST_TYPE.mentions };
    postService.getPostsByIds.mockResolvedValue({
      posts: [
        {
          id: 1,
        },
      ],
    });
    await vm.onReceiveProps(localProps);
    const returnedEntity = new Map();
    returnedEntity.set(1, { id: 1 });
    expect(mockedSortableListHandler.onDataChanged).toBeCalledWith({
      entities: returnedEntity,
      type: 'put',
    });
  });

  it('should delete old post if user removed one of the post in the postIds list', () => {
    const newPostEntities = new Map();
    newPostEntities.set(1, { id: 1, deactivated: true });
    newPostEntities.set(19, { id: 19, deactivated: true });
    notificationCenter.emit(ENTITY.POST, {
      type: EVENT_TYPES.DELETE,
      entities: newPostEntities,
    });
    expect(
      mockedSortableListHandler.sortableListStore.removeByIds,
    ).toBeCalledWith([1]);
  });
});
