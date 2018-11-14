import { t } from 'i18next';
import { Group } from 'sdk/models';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { POST_LIST_TYPE } from '@/containers/PostListPage/types';

function getMessagesTitle(messagePath?: string) {
  if (messagePath === POST_LIST_TYPE.mentions) {
    return 'Mentions';
  }
  if (messagePath && /^\d+$/.test(messagePath)) {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, +messagePath);
    return group.displayName;
  }
  return t('Messages');
}

const DOC_TITLE = {
  messages: getMessagesTitle,
  dashboard: () => t('Dashboard'),
  phone: () => t('Phone'),
  meetings: () => t('Meetings'),
  contacts: () => t('Contacts'),
  calendar: () => t('Calendar'),
  tasks: () => t('Tasks'),
  notes: () => t('Notes'),
  files: () => t('Files'),
  settings: () => t('Settings'),
};

function getDocTitle(pathname: string) {
  const paths = pathname.split('/');
  const category = paths[1].toLocaleLowerCase();
  const subPath = paths[2];

  const docTitle = DOC_TITLE[category];
  return docTitle(subPath);
}

export default getDocTitle;
