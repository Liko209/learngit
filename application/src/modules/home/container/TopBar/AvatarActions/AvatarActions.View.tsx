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
import {
  JuiAvatarActions,
  JuiDropdownContactInfo,
  JuiStyledDropdown,
} from 'jui/pattern/TopBar';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import { OpenProfileDialog } from '@/containers/common/OpenProfileDialog';
import { PRESENCE } from 'sdk/module/presence/constant';
import { JuiDivider } from 'jui/components/Divider';
import { dataAnalysis } from 'sdk';

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
    switch (presence) {
      case PRESENCE.AVAILABLE:
        return t('presence.available');
      case PRESENCE.DND:
        return t('presence.doMotDisturb');
      case PRESENCE.INMEETING:
        return t('presence.inMeeting');
      case PRESENCE.ONCALL:
        return t('presence.onCall');
      case PRESENCE.UNAVAILABLE:
      case PRESENCE.NOTREADY:
        return t('presence.offline');
      default:
        return t('presence.offline');
    }
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

  // TODO: when edit profile completed then Replenish
  handleOpenEditProfile = () => {};

  handleDropdown = () => {
    dataAnalysis.page('Jup_Web/DT__appOptions');
  };

  handleAboutPage = () => this.props.toggleAboutPage();

  handleSendFeedback = () => this.props.handleSendFeedback();

  render() {
    const { handleSignOut, currentUserId, person, t } = this.props;

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
          <JuiDropdownContactInfo
            Avatar={this._DropdownAvatar()}
            openEditProfile={this.handleOpenEditProfile}
            name={person.displayName}
            content={t('home.editProfile')}
          />
          <JuiDivider key="divider-avatar-menu" />
          <JuiMenuList data-test-automation-id="avatarMenu">
            <OpenProfileDialog id={currentUserId}>
              <JuiMenuItem
                aria-label={t('home.viewYourProfile')}
                data-test-automation-id="viewYourProfile"
              >
                {t('people.team.profile')}
              </JuiMenuItem>
            </OpenProfileDialog>
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
        </JuiStyledDropdown>
      </JuiAvatarActions>
    );
  }
}

const AvatarActionsView = withTranslation('translations')(
  AvatarActionsComponent,
);

export { AvatarActionsView };
