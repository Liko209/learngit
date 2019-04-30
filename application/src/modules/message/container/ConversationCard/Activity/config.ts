import { TypeDictionary } from 'sdk/utils';
import eventHander from './handler/event';
import codeHander from './handler/code';
import conferenceHander from './handler/conference';
import fileHander from './handler/file';
import linkHander from './handler/link';
import pageHander from './handler/page';
import taskHander from './handler/task';
import videoHander from './handler/video';
import sourceHander from './handler/source';
import childrenHander from './handler/children';
import itemsHander from './handler/items';

export default {
  source: sourceHander,
  children: childrenHander,
  items: itemsHander,
  [TypeDictionary.TYPE_ID_EVENT]: eventHander,
  [TypeDictionary.TYPE_ID_TASK]: taskHander,
  [TypeDictionary.TYPE_ID_CODE]: codeHander,
  [TypeDictionary.TYPE_ID_LINK]: linkHander,
  [TypeDictionary.TYPE_ID_RC_VIDEO]: videoHander,
  [TypeDictionary.TYPE_ID_MEETING]: videoHander,
  [TypeDictionary.TYPE_ID_CONFERENCE]: conferenceHander,
  [TypeDictionary.TYPE_ID_FILE]: fileHander,
  [TypeDictionary.TYPE_ID_PAGE]: pageHander,
};
