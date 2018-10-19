import { t } from 'i18next';
import { Group } from 'sdk/models';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';

function getMessagesTitle(id?: number) {
  if (id) {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, id);
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
  const id = paths[2];

  const docTitle = DOC_TITLE[category];
  return docTitle(id);
}

export default getDocTitle;
