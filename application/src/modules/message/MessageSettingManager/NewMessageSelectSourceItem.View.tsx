/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-05-31 11:08:47
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import JuiText from 'jui/components/Text/Text';
import { DESKTOP_MESSAGE_NOTIFICATION_OPTIONS } from 'sdk/module/profile';

type NewMessageSelectItemProps = {
  value: DESKTOP_MESSAGE_NOTIFICATION_OPTIONS;
};

class NewMessageSelectItem extends Component<
  NewMessageSelectItemProps & WithTranslation
> {
  render() {
    const { value, t } = this.props;
    return (
      <JuiText>
        {t(
          `setting.notificationAndSounds.desktopNotifications.newMessages.options.${value}`,
        )}
      </JuiText>
    );
  }
}

const NewMessageSelectSourceItem = withTranslation('translations')(
  NewMessageSelectItem,
);

export { NewMessageSelectSourceItem };
