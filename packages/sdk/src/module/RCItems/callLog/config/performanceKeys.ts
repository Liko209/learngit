/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-06-17 10:16:25
 * Copyright © RingCentral. All rights reserved.
 */
export enum CALL_LOG_POST_PERFORMANCE_KEYS {
  FETCH_CALL_LOG_FROM_DB = 'fetch_call_log_from_db',
  FILTER_AND_SORT_CALL_LOG = 'filter_and_sort_call_log',
  FETCH_CALL_LOG = 'fetch_call_log',
  CLEAR_ALL_CALL_LOG_FROM_SERVER = 'clear_all_call_log_from_server',
  CLEAR_ALL_CALL_LOG = 'clear_all_call_log',
  DELETE_CALL_LOG_FROM_SERVER = 'delete_call_log_from_server',
  DELETE_CALL_LOG = 'delete_call_log',
  INIT_RC_CALL_LOG_BADGE = 'init_rc_call_log_badge',
}
