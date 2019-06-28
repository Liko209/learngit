/*
 * @Author: Andy Hu (Andy.Hu@ringcentral.com)
 * @Date: 2019-05-31 11:08:47
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */

import { EMAIL_NOTIFICATION_OPTIONS } from 'sdk/module/profile';
import { i18nP } from '@/utils/i18nT';

type EmailNotificationItemProps = {
  value: EMAIL_NOTIFICATION_OPTIONS;
};

const EmailNotificationTimeSourceItem = (props: EmailNotificationItemProps) => {
  const { value } = props;
  return i18nP(
    `setting.notificationAndSounds.emailNotifications.options.${value}`,
  );
};

export { EmailNotificationTimeSourceItem };
