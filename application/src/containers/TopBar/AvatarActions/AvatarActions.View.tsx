/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:30:30
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ViewProps } from './types';
import { JuiPopover, JuiMenuList, JuiMenuItem } from 'jui/components';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import isElectron from '@/common/isElectron';

type AvatarActionsProps = WithNamespaces & ViewProps;

@observer
class AvatarActions extends React.Component<AvatarActionsProps> {
  state = {
    anchorEl: null,
  };
  constructor(props: AvatarActionsProps) {
    super(props);
    window.jupiterElectron = {
      ...window.jupiterElectron,
      handleAboutPage: props.toggleAboutPage,
    };
  }
  private get _presence() {
    const { currentUserId } = this.props;

    return <Presence uid={currentUserId} size="large" borderSize="large" />;
  }

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  }

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  }

  handleAboutPage = () => this.props.toggleAboutPage();

  render() {
    const { t, currentUserId, handleSignOut } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <>
        <Avatar
          uid={currentUserId}
          presence={this._presence}
          size="large"
          autoMationId="topBarAvatar"
          onClick={this.handleClick}
        />
        <JuiPopover
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
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
        </JuiPopover>
      </>
    );
  }
}

const AvatarActionsView = translate('translations')(AvatarActions);

export { AvatarActionsView };
