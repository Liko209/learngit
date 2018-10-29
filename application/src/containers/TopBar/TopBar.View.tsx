/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiIconButton, JuiIconButtonProps } from 'jui/components/Buttons';
import { JuiModal } from 'jui/components/Dialog';
import {
  JuiLogo,
  JuiTopBar,
  JuiAvatarMenu,
  JuiAddMenu,
} from 'jui/pattern/TopBar';
import { MenuListCompositionProps } from 'jui/pattern/MenuListComposition';
import { Avatar } from '@/containers/Avatar';
import { BackNForward } from '@/containers/BackNForward';
import pkg from '../../../package.json';
import { grey } from 'jui/foundation/utils/styles';
import styled from 'jui/foundation/styled-components';
import { gitCommitInfo } from '@/containers/VersionInfo/commitInfo';
import { formatDate } from '@/containers/VersionInfo/LoginVersionStatus';
import { isElectron } from '@/utils';

type TopBarProps = WithNamespaces & {
  signOut: Function;
  updateLeftNavState: (event: React.MouseEvent<HTMLElement>) => void;
  updateCreateTeamDialogState: Function;
  brandName: string;
  currentUserId: number;
  handleAboutPage: (event: React.MouseEvent<HTMLElement>) => void;
  dialogStatus: boolean;
  electronVersion: number;
  appVersion: number;
};
const Param = styled.p`
  color: ${grey('700')};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;
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
  }

  private _AvatarMenuTrigger(avatarMenuTriggerProps: JuiIconButtonProps) {
    const { currentUserId } = this.props;
    return (
      <Avatar
        uid={currentUserId}
        size="large"
        {...avatarMenuTriggerProps}
        autoMationId="topBarAvatar"
      />
    );
  }

  private _AvatarMenu(avatarProps: MenuListCompositionProps) {
    const { signOut, t, handleAboutPage } = this.props;
    window.jupiterElectron = {
      handleAboutPage,
    };
    const menusItemAboutPages = {
      label: t('About RingCentral'),
      onClick: handleAboutPage,
    };
    const menuItems = [
      {
        label: t('SignOut'),
        onClick: signOut,
      },
    ];
    !isElectron ? menuItems.unshift(menusItemAboutPages) : null;
    return (
      <JuiAvatarMenu
        menuItems={menuItems}
        MenuExpandTrigger={this._AvatarMenuTrigger}
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
    const {
      dialogStatus,
      t,
      handleAboutPage,
      electronVersion,
      appVersion,
    } = this.props;
    const commitHash = gitCommitInfo.commitInfo[0].commitHash;
    return (
      <React.Fragment>
        <JuiTopBar
          MainMenu={this._MainMenu}
          AvatarMenu={this._AvatarMenu}
          AddMenu={this._AddMenu}
          Logo={this._Logo}
          BackNForward={isElectron ? BackNForward : undefined}
        />
        <JuiModal
          open={dialogStatus}
          title={t('About RingCentral')}
          okText={t('Done')}
          onOK={handleAboutPage}
        >
          <Param>
            Version: {appVersion ? appVersion : pkg.version}{' '}
            {electronVersion ? `(E. ${electronVersion})` : null}
          </Param>
          <Param>Last Commit: {commitHash}</Param>
          <Param>Build Time: {formatDate(process.env.BUILD_TIME || '')}</Param>
          <Param>
            Copyright © 1999-
            {new Date().getFullYear()} RingCentral, Inc. All rights reserved.
          </Param>
        </JuiModal>
      </React.Fragment>
    );
  }
}
const TopBarView = translate('translations')(TopBar);

export { TopBarView };
