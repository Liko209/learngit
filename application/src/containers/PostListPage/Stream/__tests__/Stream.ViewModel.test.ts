/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-12 20:31:07
 * @Last Modified by: Chris Zhan (chris.zhan@ringcentral.com)
 * @Last Modified time: 2018-11-12 21:08:47
 */
import { StreamViewModel } from '../Stream.ViewModel';
import { POST_LIST_TYPE } from '../../types';
import { EVENT_TYPES, ENTITY } from 'sdk/service';
import { transform2Map } from '@/store/utils';

function setup(obj: any) {
  const vm = new StreamViewModel();
  Object.assign(vm, obj);
  return vm;
}

describe('StreamViewModel', () => {
  let mockedSortableListHandler: any;
  let oldProps: any;
  let vm: any;
  let newProps: any;
  beforeEach(() => {
    jest.resetAllMocks();
    mockedSortableListHandler = {
      sortableListStore: {
        getIds: jest.fn().mockReturnValue([1, 2, 3]),
        clear: jest.fn(),
        removeByIds: jest.fn(),
      },
      onDataChanged: jest.fn(),
    };
    oldProps = {
      postIds: [{ id: 1, deactivated: false }],
      type: POST_LIST_TYPE.mentions,
      _sortableListHandler: mockedSortableListHandler,
    };
    newProps = {
      type: POST_LIST_TYPE.bookmarks,
      postIds: [{ id: 1, deactivated: true }, { id: 23 }],
    };
    vm = setup(oldProps);
  });
  it('should reset the store if the router changed', () => {
    vm.onReceiveProps(newProps);
    expect(mockedSortableListHandler.sortableListStore.clear).toBeCalled();
  });
  it('should add new post if the postIds added', () => {
    const localProps = { newProps, type: oldProps.type };
    vm.onReceiveProps(localProps);
    expect(mockedSortableListHandler.onDataChanged).toBeCalledWith({
      type: EVENT_TYPES.PUT,
      entities: transform2Map(newProps.postIds),
    });
  });
  it('should delete old post if user removed one of the post in the postIds list', () => {
    vm.emit(ENTITY.POST, {
      type: EVENT_TYPES.DELETE,
      entities: [{ id: 1, deactivated: false }, { id: 19, deactivated: false }],
    });
    expect(
      mockedSortableListHandler.sortableListStore.removeByIds,
    ).toBeCalledWith([1]);
  });
});
