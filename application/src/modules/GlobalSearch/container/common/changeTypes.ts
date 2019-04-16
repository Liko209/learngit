/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-09 15:35:24
 * Copyright © RingCentral. All rights reserved.
 */
import { RecentSearchTypes } from 'sdk/module/search/entity';
import { SearchItemTypes } from '../../types';

function changeToRecordTypes(type: SearchItemTypes) {
  const recordType = {
    [SearchItemTypes.CONTENT]: RecentSearchTypes.SEARCH,
    [SearchItemTypes.SEARCH]: RecentSearchTypes.SEARCH,
    [SearchItemTypes.GROUP]: RecentSearchTypes.GROUP,
    [SearchItemTypes.TEAM]: RecentSearchTypes.TEAM,
    [SearchItemTypes.PEOPLE]: RecentSearchTypes.PEOPLE,
  };
  return recordType[type];
}

function changeToSearchType(type: RecentSearchTypes) {
  const searchType = {
    [RecentSearchTypes.SEARCH]: SearchItemTypes.SEARCH,
    [RecentSearchTypes.GROUP]: SearchItemTypes.GROUP,
    [RecentSearchTypes.TEAM]: SearchItemTypes.TEAM,
    [RecentSearchTypes.PEOPLE]: SearchItemTypes.PEOPLE,
  };
  return searchType[type];
}

export { changeToRecordTypes, changeToSearchType };
