/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 22:11:03
 * Copyright © RingCentral. All rights reserved.
 */

enum TAB_TYPE {
  CONTENT,
  PEOPLE,
  GROUPS,
  TEAM,
}

enum SEARCH_VIEW {
  INSTANT_SEARCH,
  RECENT_SEARCH,
  FULL_SEARCH,
}

enum SEARCH_SCOPE {
  GLOBAL,
  CONVERSATION,
}

export { TAB_TYPE, SEARCH_VIEW, SEARCH_SCOPE };
