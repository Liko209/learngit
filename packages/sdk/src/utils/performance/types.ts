/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-03 20:47:30
 * Copyright © RingCentral. All rights reserved.
 */

export type PerformanceItem = {
  startTime: number;
  endTime: number;
};

export enum PERFORMANCE_KEYS {
  GROUP_SECTION_FETCH_FAVORITES = 'groupSectionFetchFavorites',
  GROUP_SECTION_FETCH_DIRECT_MESSAGES = 'groupSectionFetchDirectMessages',
  GROUP_SECTION_FETCH_TEAMS = 'groupSectionFetchTeams',
}
