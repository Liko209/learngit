/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiIconButton, JuiIconButtonProps } from 'jui/components/Buttons';
import {
  JuiLogo,
  JuiTopBar,
  JuiAvatarMenu,
  JuiAddMenu,
} from 'jui/pattern/TopBar';
import { MenuListCompositionProps } from 'jui/pattern/MenuListComposition';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import { BackNForward } from '@/containers/BackNForward';
import { isElectron } from '@/utils';

type TopBarProps = WithNamespaces & {
  signOut: Function;
  updateLeftNavState: (event: React.MouseEvent<HTMLElement>) => void;
  updateCreateTeamDialogState: Function;
  brandName: string;
  currentUserId: number;
  handleAboutPage: (event: React.MouseEvent<HTMLElement>) => void;
};

@observer
class TopBar extends React.Component<TopBarProps> {
  constructor(props: TopBarProps) {
    super(props);
    this._MainMenu = this._MainMenu.bind(this);
    this._AddMenu = this._AddMenu.bind(this);
    this._Logo = this._Logo.bind(this);
    this._AvatarMenu = this._AvatarMenu.bind(this);
    this._AddMenuTrigger = this._AddMenuTrigger.bind(this);
    this._AvatarMenuTrigger = this._AvatarMenuTrigger.bind(this);
    const handleAboutPage = props.handleAboutPage;
    window.jupiterElectron = {
      ...window.jupiterElectron,
      handleAboutPage,
    };
  }

  private get _presence() {
    const { currentUserId } = this.props;

    return <Presence uid={currentUserId} size="large" />;
  }

  private _AvatarMenuTrigger(avatarMenuTriggerProps: JuiIconButtonProps) {
    const { currentUserId } = this.props;

    return (
      <Avatar
        uid={currentUserId}
        presence={this._presence}
        size="large"
        {...avatarMenuTriggerProps}
        autoMationId="topBarAvatar"
      />
    );
  }

  private _AvatarMenu(avatarProps: MenuListCompositionProps) {
    const { signOut, t, handleAboutPage } = this.props;
    const menusItemAboutPages = {
      label: t('About RingCentral'),
      onClick: handleAboutPage,
      automationId: 'aboutPage',
    };
    const menuItems = [
      {
        label: t('SignOut'),
        onClick: signOut,
        automationId: 'signOut',
      },
    ];
    !isElectron ? menuItems.unshift(menusItemAboutPages) : null;
    return (
      <JuiAvatarMenu
        menuItems={menuItems}
        MenuExpandTrigger={this._AvatarMenuTrigger}
        automationId="avatarMenu"
        {...avatarProps}
      />
    );
  }

  private _MainMenu(mainMenuProps: MenuListCompositionProps) {
    const { updateLeftNavState, t } = this.props;
    return (
      <JuiIconButton
        tooltipTitle={t('Menu')}
        size="medium"
        onClick={updateLeftNavState}
        data-test-automation-id="toggleBtn"
        {...mainMenuProps}
      >
        format_list_bulleted
      </JuiIconButton>
    );
  }

  private _Logo() {
    const { brandName } = this.props;
    return <JuiLogo variant="headline">{brandName}</JuiLogo>;
  }

  private _AddMenuTrigger(addMenuTriggerProps: JuiIconButtonProps) {
    const { t } = this.props;

    return (
      <JuiIconButton
        size="medium"
        tooltipTitle={t('Plus')}
        {...addMenuTriggerProps}
      >
        add_circle
      </JuiIconButton>
    );
  }

  private _AddMenu(menuProps: MenuListCompositionProps) {
    const { updateCreateTeamDialogState, t } = this.props;

    return (
      <JuiAddMenu
        menuItems={[
          {
            label: t('CreateTeam'),
            onClick: updateCreateTeamDialogState,
          },
        ]}
        MenuExpandTrigger={this._AddMenuTrigger}
        {...menuProps}
      />
    );
  }

  render() {
    return (
      <React.Fragment>
        <JuiTopBar
          MainMenu={this._MainMenu}
          AvatarMenu={this._AvatarMenu}
          AddMenu={this._AddMenu}
          Logo={this._Logo}
          BackNForward={isElectron ? BackNForward : undefined}
        />
      </React.Fragment>
    );
  }
}
const TopBarView = translate('translations')(TopBar);

export { TopBarView };
