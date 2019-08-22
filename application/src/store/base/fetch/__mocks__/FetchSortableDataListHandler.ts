/*
 * @Author: Spike.Yang
 * @Date: 2019-08-22 09:45:30
 * Copyright © RingCentral. All rights reserved.
 */

class FetchSortableDataListHandler {
  fetchData = jest.fn();
  getIds = jest.fn().mockReturnValue([1]);
  hasMore = jest.fn();
  dispose = jest.fn();
  removeDataChangeCallback = jest.fn();
  sortableListStore = { getIds: [1] };
}

export { FetchSortableDataListHandler };
