import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { POST_LIST_TYPE } from '@/containers/PostListPage/types';
import { toTitleCase } from '@/utils/string';
import { SETTING_LIST_TYPE } from '@/modules/setting/container/SettingLeftRail/types';
import i18nT from '@/utils/i18nT';

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
  return i18nT('message.Messages');
}

function getSettingsTitle(settingPath: string) {
  const settingI18N = i18nT('setting.Settings');
  if (
    settingPath &&
    new RegExp(`^(${Object.values(SETTING_LIST_TYPE).join('|')})$`).test(
      settingPath,
    )
  ) {
    const pathI18NKey = `setting.${getI18NKeyByRoutePath(settingPath)}`;
    return `${settingI18N}_${i18nT(pathI18NKey)}`;
  }
  return settingI18N;
}

function getI18NKeyByRoutePath(path: string) {
  return path.replace(/\_(.)/ig, (str, v) => {
    return v.toUpperCase();
  });
}

const DOC_TITLE = {
  messages: getMessagesTitle,
  dashboard: () => i18nT('dashboard.Dashboard'),
  phone: () => i18nT('telephony.Phone'),
  meetings: () => i18nT('meeting.Meetings'),
  contacts: () => i18nT('contact.Contacts'),
  calendar: () => i18nT('calendar.Calendar'),
  tasks: () => i18nT('item.tasks'),
  notes: () => i18nT('item.notes'),
  files: () => i18nT('item.files'),
  settings: getSettingsTitle,
};

function getDocTitle(pathname: string) {
  const paths = pathname.split('/');
  const category = paths[1].toLocaleLowerCase();
  const subPath = paths[2];

  const docTitle = DOC_TITLE[category];
  return docTitle(subPath);
}

export default getDocTitle;
