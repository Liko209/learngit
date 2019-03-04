/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-02-15 15:04:45
 * Copyright © RingCentral. All rights reserved.
 */
// import { getEntity } from '../../../../store/utils';
// import { PinnedListViewModel } from '../PinnedList.ViewModel';
// import { ENTITY_NAME } from '../../../../store';

jest.mock('../../../../store/utils');

// const pinnedListViewModel = new PinnedListViewModel({ groupId: 1 });

describe('PinnedList ViewModel', () => {
  beforeEach(() => {
    // jest.restoreAllMocks();
  });
  it('Check the sum of pinned when pin/unpin [JPT-1058]', () => {
    // (getEntity as jest.Mock).mockReturnValue({
    //   pinnedPostIds: [],
    // });
    // expect(pinnedListViewModel.totalCount).toBe(0);
    // (getEntity as jest.Mock).mockReturnValue({
    //   pinnedPostIds: [1, 2],
    // });
    // expect(pinnedListViewModel.totalCount).toBe(2);
  });
});
