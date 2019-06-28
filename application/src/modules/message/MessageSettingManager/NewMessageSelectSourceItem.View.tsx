/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-31 11:08:47
 * Copyright © RingCentral. All rights reserved.
 */

import { DESKTOP_MESSAGE_NOTIFICATION_OPTIONS } from 'sdk/module/profile';
import { i18nP } from '@/utils/i18nT';

type NewMessageSelectItemProps = {
  value: DESKTOP_MESSAGE_NOTIFICATION_OPTIONS;
};

const NewMessageSelectSourceItem = (props: NewMessageSelectItemProps) => {
  const { value } = props;
  return i18nP(
    `setting.notificationAndSounds.desktopNotifications.newMessages.options.${value}`,
  );
};

export { NewMessageSelectSourceItem };
