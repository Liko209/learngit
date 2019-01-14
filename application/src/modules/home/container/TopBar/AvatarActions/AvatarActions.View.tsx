/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { t } from 'i18next';
import { observer } from 'mobx-react';
import { ViewProps } from './types';
import { JuiMenuList, JuiMenuItem } from 'jui/components';
import { JuiAvatarActions } from 'jui/pattern/TopBar';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import isElectron from '@/common/isElectron';
import { Dialog } from '@/containers/Dialog';
import { ProfileDialogPerson } from '@/containers/Profile/Dialog';

@observer
class AvatarActionsView extends React.Component<ViewProps> {
  constructor(props: ViewProps) {
    super(props);
    window.jupiterElectron = {
      ...window.jupiterElectron,
      handleAboutPage: props.toggleAboutPage,
    };
    this._Anchor = this._Anchor.bind(this);
  }

  private get _presence() {
    const { currentUserId } = this.props;

    return <Presence uid={currentUserId} size="large" borderSize="large" />;
  }

  private _Anchor() {
    const { currentUserId } = this.props;
    return (
      <Avatar
        uid={currentUserId}
        presence={this._presence}
        size="large"
        automationId="topBarAvatar"
      />
    );
  }

  handleAboutPage = () => this.props.toggleAboutPage();

  handleViewYourProfile = () => {
    const { currentUserId } = this.props;
    Dialog.simple(<ProfileDialogPerson id={currentUserId} />, {
      size: 'medium',
    });
  }

  render() {
    const { handleSignOut } = this.props;

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
          <JuiMenuItem
            onClick={this.handleViewYourProfile}
            aria-label={t('viewYourProfile')}
            data-test-automation-id="viewYourProfile"
          >
            {t('Profile')}
          </JuiMenuItem>
          {!isElectron && (
            <JuiMenuItem
              onClick={this.handleAboutPage}
              aria-label={t('AboutRingCentral')}
              data-test-automation-id="aboutPage"
            >
              {t('AboutRingCentral')}
            </JuiMenuItem>
          )}
          <JuiMenuItem
            onClick={handleSignOut}
            aria-label={t('signOut')}
            data-test-automation-id="signOut"
          >
            {t('SignOut')}
          </JuiMenuItem>
        </JuiMenuList>
      </JuiAvatarActions>
    );
  }
}

export { AvatarActionsView };
