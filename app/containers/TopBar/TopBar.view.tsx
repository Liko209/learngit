/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiLogo } from 'jui/pattern/TopBar';
import { JuiTopBar } from 'jui/pattern/TopBar';
import { JuiAvatar } from 'jui/pattern/TopBar/Avatar';
import { JuiMenu } from 'jui/pattern/TopBar/Menu';
import { Avatar } from '@/containers/Avatar';

type TopBarProps = InjectedTranslateProps & {
  signOut: Function;
  updateLeftNavState: Function;
  updateCreateTeamDialogState: Function;
  brandName: string;
};

@observer
class TopBar extends React.Component<TopBarProps> {
  constructor(props: TopBarProps) {
    super(props);
  }

  private _createAvatar(avatarProps) {
    const { signOut, t } = this.props;
    return (
      <JuiAvatar
        menuItems={[
          {
            label: t('SignOut'),
            onClick: signOut,
          },
        ]}
        MenuExpandTrigger={Avatar}
        {...avatarProps}
      />
    );
  }

  private _createMainMenu(mainMenuProps) {
    const { updateLeftNavState, t } = this.props;
    return (
      <JuiIconButton
        tooltipTitle={t('Menu')}
        size="medium"
        onClick={updateLeftNavState}
        data-anchor="expandButton"
        {...mainMenuProps}
      >
        format_list_bulleted
      </JuiIconButton>
    );
  }

  private _createLogo() {
    const { brandName } = this.props;
    return <JuiLogo variant="headline">{brandName}</JuiLogo>;
  }

  private _createMenu(menuProps) {
    const { updateCreateTeamDialogState, t } = this.props;

    return (
      <JuiMenu
        menuItems={[
          {
            label: t('CreateTeam'),
            onClick: updateCreateTeamDialogState,
          },
        ]}
        MenuExpandTrigger={
          <JuiIconButton size="medium" tooltipTitle={t('plus')}>
            add_circle
          </JuiIconButton>}
        {...menuProps}
      />
    );
  }

  render() {
    const Logo = this._createLogo();
    return (
      <JuiTopBar
        MainMenu={this._createMainMenu}
        Avatar={this._createAvatar}
        Menu={this._createMenu}
        Logo={Logo}
      />
    );
  }
}
const TopBarView = translate('translations')(TopBar);

export { TopBarView };
