/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-22 09:01:10
 * Copyright © RingCentral. All rights reserved.
 */

enum RecentSearchTypes {
  TEAM = 'team',
  GROUP = 'group',
  PEOPLE = 'people',
  SEARCH = 'search',
}

type RecentSearchModel = {
  id: number;
  type: RecentSearchTypes;
  value: string | number;
  query_params: {};
  time_stamp: number;
};

export { RecentSearchModel, RecentSearchTypes };
