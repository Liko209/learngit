/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-15 15:04:45
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
import { PinnedListViewModel } from '../PinnedList.ViewModel';
// import { ENTITY_NAME } from '../../../../store';
import { QUERY_DIRECTION } from 'sdk/dao/constants';

jest.mock('../../../../store/utils');

function setup(groupModel: any) {
  (getEntity as jest.Mock).mockReturnValue(groupModel);
  const pinnedListViewModel = new PinnedListViewModel({
    groupId: 1,
    width: 1,
    height: 1,
  });

  return pinnedListViewModel;
}

describe('PinnedList ViewModel', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  it('Check the sum of pinned when pin/unpin [JPT-1058]', () => {
    let pinnedListViewModel;
    pinnedListViewModel = setup({ pinnedPostIds: [] });
    expect(pinnedListViewModel.totalCount).toBe(0);

    pinnedListViewModel = setup({ pinnedPostIds: [1, 2] });
    expect(pinnedListViewModel.totalCount).toBe(2);
  });

  it('get pinnedPostIds', () => {
    let pinnedListViewModel;
    pinnedListViewModel = setup({ pinnedPostIds: [] });
    expect(pinnedListViewModel.pinnedPostIds).toEqual([]);

    pinnedListViewModel = setup({ pinnedPostIds: [1, null] });
    expect(pinnedListViewModel.pinnedPostIds).toEqual([1]);
  });

  it('loadMore()', async () => {
    let pinnedListViewModel;
    pinnedListViewModel = setup({ pinnedPostIds: [] });
    const discontinuousPosListHandler = {
      loadMorePosts: jest.fn(),
    } as any;

    pinnedListViewModel.discontinuousPosListHandler = discontinuousPosListHandler;

    await pinnedListViewModel.loadMore(5, 5);
    expect(discontinuousPosListHandler.loadMorePosts).toBeCalledWith(
      QUERY_DIRECTION.NEWER,
      1,
    );
  });

  describe('build()', () => {
    it('If pinnedPostIds is null should return undefined', () => {
      let pinnedListViewModel;
      pinnedListViewModel = setup({ pinnedPostIds: [] });
      jest.spyOn(pinnedListViewModel, 'loadInitialData');
      pinnedListViewModel.build(null as any);
      expect(pinnedListViewModel.loadInitialData).not.toHaveBeenCalled();
    });
    it('If first init should loadInitialData', () => {
      let pinnedListViewModel;
      pinnedListViewModel = setup({ pinnedPostIds: [] });
      jest.spyOn(pinnedListViewModel, 'loadInitialData');

      // setup new pinned  will build first need reset firstInit
      // in order test loadInitialData
      Object.assign(pinnedListViewModel, {
        firstInit: true,
      });

      pinnedListViewModel.build([1]);

      expect(pinnedListViewModel.firstInit).toBeFalsy();
      expect(pinnedListViewModel.loadInitialData).toHaveBeenCalled();
    });
    it('If first init should loadInitialData', () => {
      let pinnedListViewModel;
      pinnedListViewModel = setup({ pinnedPostIds: [] });
      const discontinuousPosListHandler = {
        onSourceIdsChanged: jest.fn(),
      } as any;

      pinnedListViewModel.discontinuousPosListHandler = discontinuousPosListHandler;

      jest.spyOn(pinnedListViewModel, 'loadInitialData');
      pinnedListViewModel.firstInit = false;
      pinnedListViewModel.build([1, 2]);
      expect(
        discontinuousPosListHandler.onSourceIdsChanged,
      ).toHaveBeenCalledWith([1, 2]);
    });
  });
});
