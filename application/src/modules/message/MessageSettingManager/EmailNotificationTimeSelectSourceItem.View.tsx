/*
 * @Author: Andy Hu (Andy.Hu@ringcentral.com)
 * @Date: 2019-05-31 11:08:47
 * Copyright Ã‚Â© RingCentral. All rights reserved.
 */

import { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { EMAIL_NOTIFICATION_OPTIONS } from 'sdk/module/profile';

type EmailNotificationItemProps = {
  value: EMAIL_NOTIFICATION_OPTIONS;
};

class EmailNotificationTimeSelectItem extends Component<
  EmailNotificationItemProps & WithTranslation
> {
  render() {
    const { value, t } = this.props;
    return t(
      `setting.notificationAndSounds.emailNotifications.options.${value}`,
    );
  }
}

const EmailNotificationTimeSourceItem = withTranslation('translations')(
  EmailNotificationTimeSelectItem,
);

export { EmailNotificationTimeSourceItem };
