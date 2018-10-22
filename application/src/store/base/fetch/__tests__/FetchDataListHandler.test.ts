/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-06 20:39:29
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IFetchDataProvider,
  FetchDataListHandler,
} from '../FetchDataListHandler';

import { FetchDataDirection } from '../types';
import checkListStore from './checkListStore';

class TestFetchDataProvider implements IFetchDataProvider<number> {
  fetchData(
    offset: number,
    direction: FetchDataDirection,
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
    await fetchDataListHandler.fetchData(FetchDataDirection.DOWN);
    expect(fetchDataListHandler.hasMore(FetchDataDirection.UP)).toBeFalsy();
    expect(fetchDataListHandler.hasMore(FetchDataDirection.DOWN)).toBeTruthy();
    checkListStore(fetchDataListHandler.listStore, [1, 2]);
    await fetchDataListHandler.fetchData(FetchDataDirection.DOWN);
    checkListStore(fetchDataListHandler.listStore, [1, 2, 1, 2]);
  });
});
