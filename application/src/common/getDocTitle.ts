import i18next from 'i18next';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { POST_LIST_TYPE } from '@/containers/PostListPage/types';
import { toTitleCase } from '@/utils/string';

function getMessagesTitle(messagePath?: string) {
  if (
    messagePath &&
    new RegExp(`^(${Object.values(POST_LIST_TYPE).join('|')})$`).test(
      messagePath,
    )
  ) {
    return toTitleCase(messagePath);
  }
  if (messagePath && /^\d+$/.test(messagePath)) {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, +messagePath);
    return group.displayName;
  }
  return i18next.t('Messages');
}

const DOC_TITLE = {
  messages: getMessagesTitle,
  dashboard: () => i18next.t('Dashboard'),
  phone: () => i18next.t('Phone'),
  meetings: () => i18next.t('Meetings'),
  contacts: () => i18next.t('Contacts'),
  calendar: () => i18next.t('Calendar'),
  tasks: () => i18next.t('Tasks'),
  notes: () => i18next.t('Notes'),
  files: () => i18next.t('Files'),
  settings: () => i18next.t('Settings'),
};

function getDocTitle(pathname: string) {
  const paths = pathname.split('/');
  const category = paths[1].toLocaleLowerCase();
  const subPath = paths[2];

  const docTitle = DOC_TITLE[category];
  return docTitle(subPath);
}

export default getDocTitle;
