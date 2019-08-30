import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { POST_LIST_TYPE } from '@/modules/message/container/PostListPage/types';
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
    return messagePath;
  }
  if (messagePath && /^\d+$/.test(messagePath)) {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, +messagePath);
    return group.displayName;
  }
  return i18nP('message.Messages');
}

function getPhoneTitle(subPath: string): string {
  const baseTitle = i18nP('telephony.Phone');
  const subTitleMap = new Map([
    ['callhistory', i18nP('phone.tab.callHistory')],
    ['voicemail', i18nP('phone.voicemail')],
  ]);
  const subTitle = subTitleMap.get(subPath);
  return subTitle ? `${baseTitle} - ${subTitle}` : baseTitle;
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

function getContactsTitle(subPath: string): string {
  const baseTitle = i18nP('contact.Contacts');
  const subTitleMap = new Map([
    ['all-contacts', i18nP('contact.tab.allContacts')],
    ['company', i18nP('contact.tab.company')],
  ]);
  const subTitle = subTitleMap.get(subPath);
  return subTitle ? `${baseTitle} - ${subTitle}` : baseTitle;
}

const DOC_TITLE = {
  messages: getMessagesTitle,
  dashboard: (): string => i18nP('dashboard.Dashboard'),
  phone: getPhoneTitle,
  meetings: (): string => i18nP('meeting.Meetings'),
  contacts: getContactsTitle,
  calendar: (): string => i18nP('calendar.Calendar'),
  tasks: (): string => i18nP('item.tasks'),
  notes: (): string => i18nP('item.notes'),
  files: (): string => i18nP('item.files'),
  settings: getSettingsTitle,
};

function getDocTitle(pathname: string): string {
  const [, category, subPath] = pathname.split('/');
  const docTitle = DOC_TITLE[category.toLocaleLowerCase()];
  return docTitle ? docTitle(subPath) : '';
}

export { getMessagesTitle, getDocTitle };
