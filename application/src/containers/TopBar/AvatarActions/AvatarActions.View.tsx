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
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import isElectron from '@/common/isElectron';
<<<<<<< HEAD
import { JuiModal } from '@/containers/Dialog';
import { ProfileDialogPerson } from '@/containers/Profile/Dialog';
type AvatarActionsProps = WithNamespaces & ViewProps;
=======
>>>>>>> c48d6c0762dfb0d34da16646d87518dc5d1245e6

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
        autoMationId="topBarAvatar"
      />
    );
  }

  handleAboutPage = () => this.props.toggleAboutPage();

  handleViewYourProfile = () => {
    const { currentUserId } = this.props;
    JuiModal.open(ProfileDialogPerson, {
      componentProps: {
        id: currentUserId,
      },
      size: 'medium',
    });
  }

  render() {
    const { handleSignOut } = this.props;

    return (
      <JuiPopoverMenu
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
            data-test-automation-id="viewYourProfile"
          >
            {t('viewYourProfile')}
          </JuiMenuItem>
          {!isElectron && (
            <JuiMenuItem
              onClick={this.handleAboutPage}
              data-test-automation-id="aboutPage"
            >
              {t('aboutRingCentral')}
            </JuiMenuItem>
          )}
          <JuiMenuItem
            onClick={handleSignOut}
            data-test-automation-id="signOut"
          >
            {t('signOut')}
          </JuiMenuItem>
        </JuiMenuList>
      </JuiPopoverMenu>
    );
  }
}

export { AvatarActionsView };
