/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ViewProps } from './types';
import { JuiMenuList, JuiMenuItem } from 'jui/components';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import isElectron from '@/common/isElectron';

type AvatarActionsProps = WithNamespaces & ViewProps;

@observer
class AvatarActions extends React.Component<AvatarActionsProps> {
  constructor(props: AvatarActionsProps) {
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

  render() {
    const { t, handleSignOut } = this.props;

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
        <JuiMenuList>
          {isElectron && (
            <JuiMenuItem onClick={this.handleAboutPage}>
              {t('AboutRingCentral')}
            </JuiMenuItem>
          )}
          <JuiMenuItem onClick={handleSignOut}>{t('SignOut')}</JuiMenuItem>
        </JuiMenuList>
      </JuiPopoverMenu>
    );
  }
}

const AvatarActionsView = translate('translations')(AvatarActions);

export { AvatarActionsView };
