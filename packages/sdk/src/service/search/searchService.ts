/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 13:26:38
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation';
import pick from 'lodash/pick';
import { daoManager } from '../../dao';
import GroupDao from '../../dao/group';
import PersonDao from '../../dao/person';

import BaseService from '../../service/BaseService';
import { Person } from '../../module/person/entity';
import SearchAPI from '../../api/glip/search';
import handleData from './handleData';

import {
  CancelRequestParam,
  RequestId,
  QueryString,
  RawQuery,
  QueryByPageNum,
  InitialSearchResp,
  SearchResult,
} from './types.d';
import { SOCKET } from '../eventKey';

class SearchService extends BaseService {
  static serviceName = 'SearchService';
  static MIN_QUERY_WORD_LENGTH = 1;
  static filterKeys = [
    'group_id',
    'begin_time',
    'end_time',
    'creator_id',
    'type',
    'client_request_id',
  ];
  public activeServerRequestId?: RequestId;
  public lastQuery?: RawQuery;

  constructor() {
    const subscriptions = {
      [SOCKET.SEARCH]: handleData,
      [SOCKET.SEARCH_SCROLL]: handleData,
    };
    super(null, null, null, subscriptions);
  }

  async searchContact(key: string): Promise<object> {
    try {
      const groupDao = daoManager.getDao(GroupDao);
      const personDao = daoManager.getDao(PersonDao);
      const teams = await groupDao.searchTeamByKey(key);
      const people = await personDao.searchPeopleByKey(key);
      return {
        people,
        teams,
      };
    } catch (e) {
      mainLogger.info(`searchContact key ==> ${key}, error ===> ${e}`);
      return { people: [], teams: [] };
    }
  }

  async searchMembers(key: string): Promise<Person[]> {
    try {
      const personDao = daoManager.getDao(PersonDao);
      const people: Person[] = await personDao.searchPeopleByKey(key);
      return people;
    } catch (e) {
      mainLogger.info(`searchMembers key ==> ${key}, error ===> ${e}`);
      return [];
    }
  }
  cleanQuery(queryString: QueryString = ''): QueryString {
    const specialCharactersReg = /[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]/g; // eslint-disable-line
    const queryStringCleaned = queryString
      .replace(specialCharactersReg, ' ')
      .trim();
    const shortQueryWords = (word: QueryString): Boolean => {
      return word.length >= SearchService.MIN_QUERY_WORD_LENGTH;
    };
    return queryStringCleaned
      .split(' ')
      .filter(shortQueryWords)
      .join(' ');
  }

  async cancelSearchRequest(requestId: RequestId) {
    const params: CancelRequestParam = {
      previous_server_request_id: requestId,
    };
    return SearchAPI.search(params);
  }

  async search(query: RawQuery) {
    this.lastQuery = query;
    const cleanedQuery = this.cleanQuery(query.queryString);
    if (!cleanedQuery) {
      this.cancel();
      return;
    }
    const { request_id: requestId } = await this.remoteSearch(query);
    this.activeServerRequestId = requestId;
    return;
  }

  async remoteSearch(query: RawQuery): Promise<InitialSearchResp> {
    const _params = pick(query, [
      ...SearchService.filterKeys,
      'scroll_size',
      'slice_size',
    ]);
    const q = query.queryString;
    const params = Object.assign({ q }, _params);
    const resp = await SearchAPI.search(params);
    const data = resp.expect('search data error');
    return data;
  }

  async fetchResultsByPage(query: QueryByPageNum): Promise<SearchResult> {
    const params = {
      scroll_request_id: query.pageNum,
      search_request_id: this.activeServerRequestId,
    };
    const result = await SearchAPI.scrollSearch(params);
    const data = result.expect('scrollSearch failed');
    return data;
  }

  cancel() {
    if (this.activeServerRequestId) {
      this.cancelSearchRequest(this.activeServerRequestId);
      delete this.activeServerRequestId;
    }
  }
}

export { SearchService };
