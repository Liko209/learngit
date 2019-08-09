/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { ViewProps } from './types';
import { JuiMenuList } from 'jui/components';
import {
  JuiAvatarActions,
  JuiStyledDropdown,
  JuiStyledDropdownMenuItem,
} from 'jui/pattern/TopBar';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import { PRESENCE } from 'sdk/module/presence/constant';
import { dataAnalysis } from 'sdk';
import { PresenceMenu } from '../PresenceMenu';
import { OpenProfile } from '@/common/OpenProfile';
import { DropdownContactInfo } from '../DropdownContactInfo';

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
    const { t, presence } = this.props;
    const i18nMap = {
      [PRESENCE.AVAILABLE]: 'presence.available',
      [PRESENCE.DND]: 'presence.doNotDisturb',
      [PRESENCE.INMEETING]: 'presence.inMeeting',
      [PRESENCE.ONCALL]: 'presence.onCall',
    };
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

  private _DropdownAvatar() {
    const { currentUserId } = this.props;
    return <Avatar uid={currentUserId} size="large" />;
  }

  openProfile = () => {
    OpenProfile.show(this.props.currentUserId);
  };

  handleDropdown = () => {
    dataAnalysis.page('Jup_Web/DT__appOptions');
  };

  handleAboutPage = () => this.props.toggleAboutPage();

  handleSendFeedback = () => this.props.handleSendFeedback();

  render() {
    const { handleSignOut, t, presence, person } = this.props;

    return (
      <JuiAvatarActions
        Anchor={this._Anchor}
        onOpen={this.handleDropdown}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <JuiStyledDropdown>
          <DropdownContactInfo
            Avatar={this._DropdownAvatar()}
            openEditProfile={this.openProfile}
            name={person.userDisplayName}
            content={t('home.viewProfile')}
          />
          <JuiMenuList data-test-automation-id="avatarMenu">
            <PresenceMenu presence={presence} title={this._tooltip} />
            <JuiStyledDropdownMenuItem
              onClick={this.handleAboutPage}
              aria-label={t('home.aboutRingCentral')}
              data-test-automation-id="aboutPage"
            >
              {t('home.aboutRingCentral')}
            </JuiStyledDropdownMenuItem>
            <JuiStyledDropdownMenuItem
              onClick={this.handleSendFeedback}
              aria-label={t('home.sendFeedback')}
              data-test-automation-id="sendFeedback"
            >
              {t('home.sendFeedback')}
            </JuiStyledDropdownMenuItem>
            <JuiStyledDropdownMenuItem
              onClick={handleSignOut}
              aria-label={t('auth.signOut')}
              data-test-automation-id="signOut"
            >
              {t('auth.signOut')}
            </JuiStyledDropdownMenuItem>
          </JuiMenuList>
        </JuiStyledDropdown>
      </JuiAvatarActions>
    );
  }
}

const AvatarActionsView = withTranslation('translations')(
  AvatarActionsComponent,
);

export { AvatarActionsView };
