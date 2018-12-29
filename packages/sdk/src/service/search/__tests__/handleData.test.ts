/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:06:02
 * Copyright © RingCentral. All rights reserved.
 */

/// <reference path="../../../__tests__/types.d.ts" />

import SearchService from '../';
import handleData from '../handleData';
import { rawPostFactory, rawItemFactory } from '../../../__tests__/factories';
import notificationCenter from '../../notificationCenter';
import { transformAll } from '../../../service/utils';
import { SERVICE } from '../../eventKey';
import { IdModel } from '../../../framework/model';

jest.mock('../../notificationCenter');
jest.mock('../../../service/utils');
jest.mock('../../search');

const searchService = new SearchService();
SearchService.getInstance = jest.fn().mockReturnValue(searchService);

describe('Service handleData', () => {
  beforeEach(() => {
    searchService.activeServerRequestId = 1;
    searchService.cancelSearchRequest = jest.fn();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('Canceled previous request', () => {
    const post = rawPostFactory.build({ _id: 7160004 });
    const item = rawItemFactory.build();
    handleData({
      results: [post, item],
      request_id: 2,
      scroll_request_id: 1,
      query: '1',
      response_id: 1,
    });
    expect(searchService.cancelSearchRequest).toHaveBeenLastCalledWith(2);
  });
  it('Search End with no result', () => {
    handleData({
      results: [],
      request_id: 1,
      scroll_request_id: 1,
      query: '2',
      response_id: 1,
    });
    expect(searchService.cancelSearchRequest).toHaveBeenLastCalledWith(1);
    expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
      SERVICE.SEARCH_END,
    );
  });
  it('Search Success', () => {
    const post = rawPostFactory.build({ _id: 71680004 });
    const item = rawItemFactory.build();
    const transformedData: IdModel[] = [];
    transformAll.mockReturnValue(transformedData);

    handleData({
      results: [item, post],
      request_id: 1,
      scroll_request_id: 1,
      query: '2',
      response_id: 1,
    });

    expect(searchService.cancelSearchRequest).not.toHaveBeenLastCalledWith(1);
    expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
      SERVICE.SEARCH_SUCCESS,
      transformedData,
    );
  });

  it('Search success with no post', () => {
    const item = rawItemFactory.build();
    const transformedData = [];
    transformAll.mockReturnValue(transformedData);

    handleData({
      results: [item],
      request_id: 1,
      scroll_request_id: 1,
      query: '2',
      response_id: 1,
    });
    expect(notificationCenter.emitKVChange).toHaveBeenCalledWith(
      SERVICE.SEARCH_SUCCESS,
      [],
    );
  });
});
