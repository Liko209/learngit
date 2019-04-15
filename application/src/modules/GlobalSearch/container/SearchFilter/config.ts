/*
 * @Author: ken.li
 * @Date: 2019-04-10 22:05:16
 * Copyright © RingCentral. All rights reserved.
 */
import { ESearchContentTypes } from 'sdk/api/glip/search';
import { TypeDictionary } from 'sdk/utils';

import { DATE_DICTIONARY } from './types';
const TYPE_MAP = [
  { id: '', name: 'All', value: ESearchContentTypes.ALL },
  {
    id: TypeDictionary.TYPE_ID_POST,
    name: 'Messages',
    value: ESearchContentTypes.CHATS,
  },
  {
    id: TypeDictionary.TYPE_ID_EVENT,
    name: 'Events',
    value: ESearchContentTypes.EVENTS,
  },
  {
    id: TypeDictionary.TYPE_ID_FILE,
    name: 'Files',
    value: ESearchContentTypes.FILES,
  },
  {
    id: TypeDictionary.TYPE_ID_LINK,
    name: 'Links',
    value: ESearchContentTypes.LINKS,
  },
  {
    id: TypeDictionary.TYPE_ID_PAGE,
    name: 'Notes',
    value: ESearchContentTypes.NOTES,
  },
  {
    id: TypeDictionary.TYPE_ID_TASK,
    name: 'Tasks',
    value: ESearchContentTypes.TASKS,
  },
];
const timePostedItem = [
  { id: DATE_DICTIONARY.ANY_TIME, value: 'Anytime' },
  { id: DATE_DICTIONARY.THIS_WEEK, value: 'ThisWeek' },
  { id: DATE_DICTIONARY.THIS_MONTH, value: 'ThisMonth' },
  { id: DATE_DICTIONARY.THIS_YEAR, value: 'ThisYear' },
];

export { timePostedItem, TYPE_MAP };
