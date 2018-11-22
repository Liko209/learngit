/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-06 20:39:29
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IFetchDataProvider,
  FetchDataListHandler,
} from '../FetchDataListHandler';

import checkListStore from './checkListStore';
import { QUERY_DIRECTION } from 'sdk/dao';

class TestFetchDataProvider implements IFetchDataProvider<number> {
  fetchData(
    offset: number,
    direction: QUERY_DIRECTION,
    pageSize: number,
    anchor: number,
  ): Promise<number[]> {
    return Promise.resolve([1, 2]);
  }
}

describe('FetchDataListHandler', () => {
  let fetchDataListHandler: FetchDataListHandler<number>;
  beforeEach(() => {
    const dataProvider = new TestFetchDataProvider();
    fetchDataListHandler = new FetchDataListHandler<number>(dataProvider, {
      pageSize: 2,
    });
  });
  it('fetchData', async () => {
    await fetchDataListHandler.fetchData(QUERY_DIRECTION.NEWER);
    expect(fetchDataListHandler.hasMore(QUERY_DIRECTION.OLDER)).toBeFalsy();
    expect(fetchDataListHandler.hasMore(QUERY_DIRECTION.NEWER)).toBeTruthy();
    checkListStore(fetchDataListHandler.listStore, [1, 2]);
    await fetchDataListHandler.fetchData(QUERY_DIRECTION.NEWER);
    checkListStore(fetchDataListHandler.listStore, [1, 2, 1, 2]);
  });
});
