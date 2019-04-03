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
  return i18next.t('message.Messages');
}

const DOC_TITLE = {
  messages: getMessagesTitle,
  dashboard: () => i18next.t('dashboard.Dashboard'),
  phone: () => i18next.t('telephony.Phone'),
  meetings: () => i18next.t('meeting.Meetings'),
  contacts: () => i18next.t('contact.Contacts'),
  calendar: () => i18next.t('calendar.Calendar'),
  tasks: () => i18next.t('item.tasks'),
  notes: () => i18next.t('item.notes'),
  files: () => i18next.t('item.files'),
  settings: () => i18next.t('setting.Settings'),
};

function getDocTitle(pathname: string) {
  const paths = pathname.split('/');
  const category = paths[1].toLocaleLowerCase();
  const subPath = paths[2];

  const docTitle = DOC_TITLE[category];
  return docTitle(subPath);
}

export default getDocTitle;
