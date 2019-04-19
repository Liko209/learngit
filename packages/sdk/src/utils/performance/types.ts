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
  SEARCH_ALL_GROUP = 'search_all_group',
  GOTO_CONVERSATION_SHELF_FETCH_ITEMS = 'goto_conversation_shelf_fetch_items',
  GOTO_CONVERSATION_FETCH_POSTS = 'goto_conversation_fetch_posts',
  GOTO_CONVERSATION_FETCH_ITEMS = 'goto_conversation_fetch_items',
  CONVERSATION_FETCH_FROM_DB = 'conversation_fetch_from_db',
  CONVERSATION_FETCH_FROM_SERVER = 'conversation_fetch_from_server',
  CONVERSATION_HANDLE_DATA_FROM_SERVER = 'conversation_handle_data_from_server',
  LOG_FETCH_FROM_DB = 'log_fetch_from_db',
  HANDLE_INCOMING_ACCOUNT = 'handle_incoming_account',
  HANDLE_INCOMING_COMPANY = 'handle_incoming_company',
  HANDLE_INCOMING_ITEM = 'handle_incoming_item',
  HANDLE_INCOMING_PRESENCE = 'handle_incoming_presence',
  HANDLE_INCOMING_STATE = 'handle_incoming_state',
  HANDLE_INCOMING_PROFILE = 'handle_incoming_profile',
  HANDLE_INCOMING_PERSON = 'handle_incoming_person',
  HANDLE_INCOMING_GROUP = 'handle_incoming_group',
  HANDLE_INCOMING_POST = 'handle_incoming_post',
  SEARCH_POST = 'search_post',
  SCROLL_SEARCH_POST = 'scroll_search_post',
  HANDLE_INDEX_DATA = 'handle_index_data',
  HANDLE_REMAINING_DATA = 'handle_remaining_data',
  HANDLE_INITIAL_DATA = 'handle_initial_data',
  FETCH_LEFT_RAIL = 'fetch_left_rail',
  UNIFIED_LOGIN = 'unified_login',
  FIRST_LOGIN = 'first_login',
}
