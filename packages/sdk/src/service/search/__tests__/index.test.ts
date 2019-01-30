/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:06:08
 * Copyright © RingCentral. All rights reserved.
 */

/// <reference path="../../../__tests__/types.d.ts" />

import { daoManager, PersonDao } from '../../../dao';
import { GroupDao } from '../../../module/group/dao';
import SearchService from '../../../service/search';
import SearchAPI from '../../../api/glip/search';

const searchService = new SearchService();

jest.mock('../../../dao', () => {
  const search = { searchTeamByKey: jest.fn(), searchPeopleByKey: jest.fn() };
  return {
    daoManager: {
      getDao: () => search,
    },
  };
});

const groupDao: GroupDao = daoManager.getDao(GroupDao);
const personDao: PersonDao = daoManager.getDao(PersonDao);

describe('searchContact()', () => {
  it('search by key', async () => {
    groupDao.searchTeamByKey.mockReturnValueOnce({
      1: 'teams1',
    });
    personDao.searchPeopleByKey.mockReturnValueOnce({
      1: 'people1',
    });

    const ret = await searchService.searchContact('123');
    expect(ret).toEqual({
      people: {
        1: 'people1',
      },
      teams: {
        1: 'teams1',
      },
    });
  });
  it('search by key error', async () => {
    personDao.searchPeopleByKey.mockImplementationOnce(() => {
      throw new Error('error');
    });

    const ret = await searchService.searchContact('123');
    expect(ret).toEqual({ people: [], teams: [] });
  });
});

describe('seachMembers()', () => {
  it('should return dao query result if success', async () => {
    personDao.searchPeopleByKey.mockReturnValueOnce({
      1: 'people1',
    });

    const ret = await searchService.searchMembers('123');
    expect(ret).toEqual({
      1: 'people1',
    });
  });
  it('should return empty array if query fail', async () => {
    personDao.searchPeopleByKey.mockImplementationOnce(() => {
      throw new Error('error');
    });

    const ret = await searchService.searchMembers('123');
    expect(ret).toEqual([]);
  });
});

jest.mock('../../../api/glip/search');

SearchAPI.search = jest.fn();
SearchAPI.scrollSearch = jest.fn();

describe('SearchService', () => {
  describe('cleanQuery()', () => {
    it('cleanQuery() with special chars', () => {
      searchService.activeServerRequestId = 1;
      expect(searchService.cleanQuery('\x00abcd')).toBe('abcd');
    });
    it('cleanQuery() without params', () => {
      searchService.activeServerRequestId = 1;
      expect(searchService.cleanQuery()).toBe('');
    });
  });
  describe('canceled search', () => {
    it('cleaned Query with activeServerRequestId', () => {
      searchService.search({ queryString: ' ' });
      expect(searchService.activeServerRequestId).toBeUndefined();
    });
    it('cleaned Query without activeServerRequestId', () => {
      delete searchService.activeServerRequestId;
      searchService.search({ queryString: ' ' });
      expect(searchService.activeServerRequestId).toBeUndefined();
    });
    it('cancelSearchRequest()', () => {
      searchService.cancelSearchRequest(1230);
      expect(SearchAPI.search).toHaveBeenCalledWith({
        previous_server_request_id: 1230,
      });
    });
  });
  it('remoteSearch()', () => {
    searchService.remoteSearch({
      type: 'all',
      scroll_size: 50,
      queryString: 'q',
    });
    expect(SearchAPI.search).toHaveBeenCalledWith({
      type: 'all',
      scroll_size: 50,
      q: 'q',
    });
  });

  it('fetchResultsByPage()', () => {
    searchService.activeServerRequestId = 1;
    searchService.fetchResultsByPage({ pageNum: 1 });
    expect(SearchAPI.scrollSearch).toHaveBeenCalledWith({
      scroll_request_id: 1,
      search_request_id: 1,
    });
  });

  describe('search()', () => {
    it('search query', async () => {
      searchService.remoteSearch = jest.fn(async () => {
        return { request_id: 1 };
      });
      await searchService.search({ queryString: 'q' });
      expect(searchService.activeServerRequestId).toEqual(1);
    });
  });
});
