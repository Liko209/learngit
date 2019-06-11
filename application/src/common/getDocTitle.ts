import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { POST_LIST_TYPE } from '@/modules/message/container/PostListPage/types';
import { toTitleCase } from '@/utils/string';
import { i18nP } from '@/utils/i18nT';

//
// TODO refactor this file
// We don't want to modify this file every time when add/remove modules.
// The title getter functions here belongs to biz modules.
//

function getMessagesTitle(messagePath?: string): string {
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
  return i18nP('message.Messages');
}

function getSettingsTitle(settingPath: string): string {
  const baseTitle = i18nP('setting.Settings');
  const subTitleMap = new Map([
    ['general', i18nP('setting.general')],
    ['notification_and_sounds', i18nP('setting.notificationAndSounds.title')],
    ['messages', i18nP('setting.messages')],
    ['phone', i18nP('setting.phone.title')],
    ['calendar', i18nP('setting.calendar')],
    ['meetings', i18nP('setting.meetings')],
  ]);
  const titleArray = [baseTitle];
  const subTitle = subTitleMap.get(settingPath);
  if (subTitle) {
    titleArray.push(subTitle);
  }
  return titleArray.join(' - ');
}

const DOC_TITLE = {
  messages: getMessagesTitle,
  dashboard: (): string => i18nP('dashboard.Dashboard'),
  phone: (): string => i18nP('telephony.Phone'),
  meetings: (): string => i18nP('meeting.Meetings'),
  contacts: (): string => i18nP('contact.Contacts'),
  calendar: (): string => i18nP('calendar.Calendar'),
  tasks: (): string => i18nP('item.tasks'),
  notes: (): string => i18nP('item.notes'),
  files: (): string => i18nP('item.files'),
  settings: getSettingsTitle,
};

function getDocTitle(pathname: string): string {
  const paths = pathname.split('/');
  const category = paths[1].toLocaleLowerCase();
  const subPath = paths[2];

  const docTitle = DOC_TITLE[category];
  return docTitle(subPath);
}

export default getDocTitle;
export { getMessagesTitle };
