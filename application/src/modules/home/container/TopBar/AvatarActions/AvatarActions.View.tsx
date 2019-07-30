/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { ViewProps } from './types';
import { JuiMenuList, JuiMenuItem } from 'jui/components';
import { JuiAvatarActions } from 'jui/pattern/TopBar';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import { OpenProfileDialog } from '@/containers/common/OpenProfileDialog';
import { PRESENCE } from 'sdk/module/presence/constant';
import { PresenceMenu } from '../PresenceMenu';

type Props = ViewProps & WithTranslation;

@observer
class AvatarActionsComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    if (window.jupiterElectron) {
      window.jupiterElectron.handleAboutPage = props.toggleAboutPage;
    }

    this._Anchor = this._Anchor.bind(this);
  }

  private get _presence() {
    const { currentUserId } = this.props;

    return <Presence uid={currentUserId} size="large" borderSize="large" />;
  }

  private get _tooltip() {
    const { t, presence } = this.props
    const i18nMap = {
      [PRESENCE.AVAILABLE]: 'presence.available',
      [PRESENCE.DND]: 'presence.doNotDisturb',
      [PRESENCE.INMEETING]: 'presence.inMeeting',
      [PRESENCE.ONCALL]: 'presence.onCall',
    }
    return t(i18nMap[presence] || 'presence.offline');
  }

  private _Anchor() {
    const { currentUserId } = this.props;
    return (
      <Avatar
        uid={currentUserId}
        presence={this._presence}
        size="large"
        automationId="topBarAvatar"
        tooltip={this._tooltip}
      />
    );
  }

  handleAboutPage = () => this.props.toggleAboutPage();

  handleSendFeedback = () => this.props.handleSendFeedback();

  render() {
    const { handleSignOut, currentUserId, t, presence } = this.props;

    return (
      <JuiAvatarActions
        Anchor={this._Anchor}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <JuiMenuList data-test-automation-id="avatarMenu">
          <OpenProfileDialog id={currentUserId}>
            <JuiMenuItem
              aria-label={t('home.viewYourProfile')}
              data-test-automation-id="viewYourProfile"
            >
              {t('people.team.profile')}
            </JuiMenuItem>
          </OpenProfileDialog>
          <PresenceMenu presence={presence} title={this._tooltip} />
          <JuiMenuItem
            onClick={this.handleAboutPage}
            aria-label={t('home.aboutRingCentral')}
            data-test-automation-id="aboutPage"
          >
            {t('home.aboutRingCentral')}
          </JuiMenuItem>
          <JuiMenuItem
            onClick={this.handleSendFeedback}
            aria-label={t('home.sendFeedback')}
            data-test-automation-id="sendFeedback"
          >
            {t('home.sendFeedback')}
          </JuiMenuItem>
          <JuiMenuItem
            onClick={handleSignOut}
            aria-label={t('auth.signOut')}
            data-test-automation-id="signOut"
          >
            {t('auth.signOut')}
          </JuiMenuItem>
        </JuiMenuList>
      </JuiAvatarActions>
    );
  }
}

const AvatarActionsView = withTranslation('translations')(
  AvatarActionsComponent,
);

export { AvatarActionsView };
