/*
 * @Author: Andy Hu (Andy.Hu@ringcentral.com)
 * @Date: 2019-05-31 11:08:47
 * Copyright Â© RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { NEW_MESSAGE_BADGES_OPTIONS } from 'sdk/module/profile';
import { JuiText } from 'jui/components/Text';

type BadgeCountItemProps = {
  value: NEW_MESSAGE_BADGES_OPTIONS;
};

class BadgeCountSelectItem extends Component<
  BadgeCountItemProps & WithTranslation
> {
  render() {
    const { value, t } = this.props;
    return (
      <JuiText>
        {t(
          `setting.notificationAndSounds.otherNotificationSettings.newMessageBadgeCount.options.${value}`,
        )}
      </JuiText>
    );
  }
}

const BadgeCountSourceItem = withTranslation('translations')(
  BadgeCountSelectItem,
);

export { BadgeCountSourceItem };
