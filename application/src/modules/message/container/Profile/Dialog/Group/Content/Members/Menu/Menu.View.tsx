/*
 * @Author: looper.wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-12 09:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observable } from 'mobx';
import { JuiMenuList, JuiMenuItem } from 'jui/components/Menus';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import { MenuViewProps } from './types';
import { JuiIconography } from 'jui/foundation/Iconography';
import { catchError } from '@/common/catchError';

type Props = MenuViewProps & RouteComponentProps & WithTranslation;
@observer
class MenuViewComponent extends Component<Props> {
  @observable
  menuAnchorEl: HTMLElement | null = null;

  @catchError.flash({
    network: 'people.prompt.removeMemberNetworkError',
    server: 'people.prompt.removeMemberBackendError',
  })
  private _handleRemoveFromTeam = async (event: MouseEvent<HTMLElement>) => {
    event && event.stopPropagation();
    const { onMenuClose, removeFromTeam } = this.props;
    onMenuClose();
    await removeFromTeam();
  };

  @catchError.flash({
    network: 'people.prompt.revokeTeamAdminNetworkError',
    server: 'people.prompt.revokeTeamAdminBackendError',
  })
  private _revokeTeamAdminHandle = async () => {
    const { toggleTeamAdmin } = this.props;
    await toggleTeamAdmin();
  };

  @catchError.flash({
    network: 'people.prompt.makeTeamAdminNetworkError',
    server: 'people.prompt.makeTeamAdminBackendError',
  })
  private _makeTeamAdminHandle = async () => {
    const { toggleTeamAdmin } = this.props;
    await toggleTeamAdmin();
  };

  private _toggleTeamAdmin = async (event: MouseEvent<HTMLElement>) => {
    event && event.stopPropagation();
    const { onMenuClose, isThePersonAdmin } = this.props;
    onMenuClose();
    await (isThePersonAdmin
      ? this._revokeTeamAdminHandle()
      : this._makeTeamAdminHandle());
  };

  private _Anchor = () => {
    return (
      <JuiIconography data-test-automation-id="moreIcon" iconSize="small">
        more_horiz
      </JuiIconography>
    );
  };

  private _onClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    this.props.onMenuClose();
  };
  render() {
    const {
      isCurrentUserSelf,
      t,
      isThePersonAdmin,
      isThePersonGuest,
    } = this.props;

    return (
      <JuiPopoverMenu
        Anchor={this._Anchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={this._onClose}
      >
        <JuiMenuList>
          {!isCurrentUserSelf && (
            <JuiMenuItem
              data-test-automation-id="removeFromTeam"
              onClick={this._handleRemoveFromTeam}
            >
              {t('people.team.removeFromTeam')}
            </JuiMenuItem>
          )}
          {!isThePersonGuest && isThePersonAdmin && (
            <JuiMenuItem
              data-test-automation-id="revokeTeamAdmin"
              onClick={this._toggleTeamAdmin}
            >
              {t('people.team.revokeTeamAdmin')}
            </JuiMenuItem>
          )}
          {!isThePersonGuest && !isThePersonAdmin && (
            <JuiMenuItem
              data-test-automation-id="makeTeamAdmin"
              onClick={this._toggleTeamAdmin}
            >
              {t('people.team.makeTeamAdmin')}
            </JuiMenuItem>
          )}
        </JuiMenuList>
      </JuiPopoverMenu>
    );
  }
}

const MenuView = withRouter(withTranslation('translations')(MenuViewComponent));

export { MenuView, MenuViewComponent };
