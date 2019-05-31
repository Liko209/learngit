import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { POST_LIST_TYPE } from '@/modules/message/container/PostListPage/types';
import { toTitleCase } from '@/utils/string';
import { SETTING_LIST_TYPE } from '@/modules/setting/container/SettingLeftRail/types';
import i18nT, { i18nTValueProps } from '@/utils/i18nT';

function getMessagesTitle(messagePath?: string): i18nTValueProps {
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

function getSettingsTitle(settingPath: string): i18nTValueProps {
  const settingI18N = i18nT('setting.Settings');
  if (
    settingPath &&
    new RegExp(`^(${Object.values(SETTING_LIST_TYPE).join('|')})$`).test(
      settingPath,
    )
  ) {
    const pathI18NKey = `setting.${getI18NKeyByRoutePath(settingPath)}.title`;
    return `${settingI18N} - ${i18nT(pathI18NKey)}`;
  }
  return settingI18N;
}

function getI18NKeyByRoutePath(path: string) {
  return path.replace(/\_(.)/gi, (str, v) => {
    return v.toUpperCase();
  });
}

const DOC_TITLE = {
  messages: getMessagesTitle,
  dashboard: (): i18nTValueProps => i18nT('dashboard.Dashboard'),
  phone: (): i18nTValueProps => i18nT('telephony.Phone'),
  meetings: (): i18nTValueProps => i18nT('meeting.Meetings'),
  contacts: (): i18nTValueProps => i18nT('contact.Contacts'),
  calendar: (): i18nTValueProps => i18nT('calendar.Calendar'),
  tasks: (): i18nTValueProps => i18nT('item.tasks'),
  notes: (): i18nTValueProps => i18nT('item.notes'),
  files: (): i18nTValueProps => i18nT('item.files'),
  settings: getSettingsTitle,
};

function getDocTitle(pathname: string): i18nTValueProps {
  const paths = pathname.split('/');
  const category = paths[1].toLocaleLowerCase();
  const subPath = paths[2];

  const docTitle = DOC_TITLE[category];
  return docTitle(subPath);
}

export default getDocTitle;
