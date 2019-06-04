/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-01-03 20:47:30
 * Copyright © RingCentral. All rights reserved.
 */

export enum PERFORMANCE_KEYS {
  GROUP_SECTION_FETCH_FAVORITES = 'group_section_fetch_favorites',
  GROUP_SECTION_FETCH_DIRECT_MESSAGES = 'group_section_fetch_direct_messages',
  GROUP_SECTION_FETCH_TEAMS = 'group_section_fetch_teams',
  SWITCH_CONVERSATION = 'switch_conversation',
  SEARCH_PERSON = 'search_people',
  SEARCH_GROUP = 'search_group',
  SEARCH_TEAM = 'search_team',
  SEARCH_ALL_GROUP = 'search_all_group',
  SEARCH_PHONE_NUMBER = 'search_phone_number',
  GOTO_CONVERSATION_SHELF_FETCH_ITEMS = 'goto_conversation_shelf_fetch_items',
  GOTO_CONVERSATION_FETCH_POSTS = 'goto_conversation_fetch_posts',
  GOTO_CONVERSATION_FETCH_ITEMS = 'goto_conversation_fetch_items',
  CONVERSATION_FETCH_FROM_DB = 'conversation_fetch_from_db',
  CONVERSATION_FETCH_UNREAD_POST = 'conversation_fetch_unread_post',
  CONVERSATION_FETCH_INTERVAL_POST = 'conversation_fetch_interval_post',
  CONVERSATION_FETCH_FROM_SERVER = 'conversation_fetch_from_server',
  CONVERSATION_HANDLE_DATA_FROM_SERVER = 'conversation_handle_data_from_server',
  LOG_FETCH_FROM_DB = 'log_fetch_from_db',
  SEARCH_POST = 'search_post',
  SCROLL_SEARCH_POST = 'scroll_search_post',

  HANDLE_INDEX_DATA = 'handle_index_data',
  HANDLE_REMAINING_DATA = 'handle_remaining_data',
  HANDLE_INITIAL_DATA = 'handle_initial_data',

  HANDLE_INITIAL_INCOMING = 'handle_initial_incoming_',
  HANDLE_INDEX_INCOMING = 'handle_index_incoming_',
  HANDLE_REMAINING_INCOMING = 'handle_remaining_incoming_',

  FETCH_LEFT_RAIL = 'fetch_left_rail',
  UNIFIED_LOGIN = 'unified_login',
  FIRST_LOGIN = 'first_login',
  INIT_GROUP_MEMBERS = 'init_group_members',
  LOAD_PHONE_PARSER = 'load_phone_parser',
  INIT_PHONE_PARSER = 'init_phone_parser',

  // call log
  INIT_CALL_LOG_BADGE = 'init_call_log_badge',
  FETCH_CALL_LOG = 'fetch_call_log',
  FETCH_CALL_LOG_FROM_DB = 'fetch_call_log_from_db',
  CLEAR_ALL_CALL_LOG = 'clear_all_call_log',
  CLEAR_ALL_CALL_LOG_FROM_SERVER = 'clear_all_call_log_from_server',
  DELETE_CALL_LOG = 'delete_call_log',
  DELETE_CALL_LOG_FROM_SERVER = 'delete_call_log_from_server',

  // voicemail
  FETCH_VOICEMAILS = 'fetch_voicemails',
  FETCH_VOICEMAILS_FROM_DB = 'fetch_voicemails_from_db',
  CLEAR_ALL_VOICEMAILS = 'clear_all_voicemails',
  CLEAR_ALL_VOICEMAILS_FROM_SERVER = 'clear_all_voicemails_from_server',

  // rc message
  INIT_RC_MESSAGE_BADGE = 'init_rc_message_badge',
  DELETE_RC_MESSAGE = 'delete_rc_message',
  DELETE_RC_MESSAGE_FROM_SERVER = 'delete_rc_message_from_server',
}

export type PerformanceInfo = {
  key: string;
  time?: number;
  count?: number;
  infos?: any;
};
