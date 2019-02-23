/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-01 13:42:43
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-02-23 11:11:25
 */

export const ACCOUNT_COLLECTION_NAME = 'account';
export const ACCOUNT_USER_ID = 'user_id';
export const ACCOUNT_PROFILE_ID = 'profile_id';
export const ACCOUNT_COMPANY_ID = 'company_id';
export const ACCOUNT_CLIENT_CONFIG = 'client_config';
export const ACCOUNT_CONVERSATION_LIST_LIMITS = 'max_conversations';
export const UNREAD_TOGGLE_ON = 'unread_toggle_on';
export const RECENT_SEARCH_RECORDS = 'recent_search_records'; // to do, will refine by later in this ticket FIJI-2785
export const ACCOUNT_USER_ID_KEY = `${ACCOUNT_COLLECTION_NAME}/${ACCOUNT_USER_ID}`;
export const ACCOUNT_KEYS = [
  ACCOUNT_USER_ID,
  ACCOUNT_PROFILE_ID,
  ACCOUNT_COMPANY_ID,
  ACCOUNT_CLIENT_CONFIG,
  RECENT_SEARCH_RECORDS,
];
