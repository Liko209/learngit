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
  GROUP_SECTION_FETCH_FAVORITES = 'group_section_fetch_favorites',
  GROUP_SECTION_FETCH_DIRECT_MESSAGES = 'group_section_fetch_direct_messages',
  GROUP_SECTION_FETCH_TEAMS = 'group_section_fetch_teams',
  SWITCH_CONVERSATION = 'switch_conversation',
  SEARCH_PERSON = 'search_people',
  SEARCH_GROUP = 'search_group',
  SEARCH_TEAM = 'search_team',
}
