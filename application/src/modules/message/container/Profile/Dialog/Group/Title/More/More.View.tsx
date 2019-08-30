/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
// import { JuiHorizMenu } from 'jui/pattern/GroupTeamProfile';
import { JuiIconButton } from 'jui/components/Buttons';
// import copy from 'copy-to-clipboard';
// import { accessHandler } from '../../AccessHandler';
import { MoreViewProps } from './types';
import { JuiMenuList, JuiMenuItem } from 'jui/components/Menus';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import copy from 'copy-to-clipboard';
import { analyticsCollector } from '@/AnalyticsCollector';
import { NotificationPreferences } from '@/containers/NotificationPreferences';

@observer
class More extends React.Component<WithTranslation & MoreViewProps> {
  renderAnchor = () => {
    const { t, size } = this.props;
    return (
      <JuiIconButton
        size={size}
        data-name="actionBarMore"
        tooltipTitle={t('common.more')}
        ariaLabel={t('people.profile.checkMoreTeamOption')}
      >
        more_horiz
      </JuiIconButton>
    );
  };

  onClickCopyUrl = () => {
    const { url } = this.props;
    copy(url);
    analyticsCollector.copyTeamURL();
  };

  onClickCopyEmail = async () => {
    const { email } = this.props;
    copy(email);
    analyticsCollector.copyTeamEmail();
  };

  onClickNotificationPreferences = () =>
    NotificationPreferences.show({ groupId: this.props.id });

  render() {
    const { t, automationId } = this.props;
    return (
      <JuiPopoverMenu
        Anchor={this.renderAnchor}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <JuiMenuList data-test-automation-id={automationId ? automationId : 'more'}>
          <JuiMenuItem
            onClick={this.onClickNotificationPreferences}
            data-test-automation-id="notificationPreferences"
          >
            {t('setting.conversationPreferences.entry')}
          </JuiMenuItem>
          <JuiMenuItem onClick={this.onClickCopyUrl}>
            {t('people.profile.copyUrl')}
          </JuiMenuItem>
          <JuiMenuItem onClick={this.onClickCopyEmail}>
            {t('people.profile.copyEmail')}
          </JuiMenuItem>
        </JuiMenuList>
      </JuiPopoverMenu>
    );
  }
}
const MoreView = withTranslation('translations')(More);
export { MoreView };
