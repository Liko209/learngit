/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-06-18 09:13:44
 * Copyright © RingCentral. All rights reserved.
 */

import { ESearchContentTypes } from 'sdk/api/glip/search';
import { TypeDictionary } from 'sdk/utils/glip-type-dictionary';

const NULL_REQUEST_ID = 0;
const TYPE_ID_OF_ALL = 0;
const SearchFilterTypes = {
  [ESearchContentTypes.ALL]: TYPE_ID_OF_ALL,
  [ESearchContentTypes.CHATS]: TypeDictionary.TYPE_ID_POST,
  [ESearchContentTypes.EVENTS]: TypeDictionary.TYPE_ID_EVENT,
  [ESearchContentTypes.FILES]: TypeDictionary.TYPE_ID_FILE,
  [ESearchContentTypes.LINKS]: TypeDictionary.TYPE_ID_LINK,
  [ESearchContentTypes.NOTES]: TypeDictionary.TYPE_ID_PAGE,
  [ESearchContentTypes.TASKS]: TypeDictionary.TYPE_ID_TASK,
};

const EmptySearchRes = {
  posts: [],
  items: [],
  hasMore: false,
  requestId: NULL_REQUEST_ID,
  contentCount: {},
};
export { SearchFilterTypes, TYPE_ID_OF_ALL, EmptySearchRes };
