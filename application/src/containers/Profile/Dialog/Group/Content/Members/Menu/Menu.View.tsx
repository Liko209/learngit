/*
 * @Author: looper.wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-12 09:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { translate, WithNamespaces } from 'react-i18next';
import { observable } from 'mobx';
import { JuiMenuList, JuiMenuItem } from 'jui/components';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import { MenuViewProps } from './types';
import { JuiIconography } from 'jui/foundation/Iconography';

type Props = MenuViewProps & RouteComponentProps & WithNamespaces;
type State = {
  open: boolean;
};
@observer
class MenuViewComponent extends Component<Props, State> {
  state = {
    open: false,
  };
  @observable
  menuAnchorEl: HTMLElement | null = null;

  private _handleRemoveFromTeam = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const { onMenuClose, removeFromTeam } = this.props;
    onMenuClose();
    removeFromTeam();
  }

  private _toggleTeamAdmin = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const { onMenuClose, toggleTeamAdmin } = this.props;
    onMenuClose();
    toggleTeamAdmin();
  }

  private _Anchor = () => {
    return <JuiIconography fontSize="small">more_horiz</JuiIconography>;
  }

  private _onClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    this.props.onMenuClose();
  }
  render() {
    const {
      isCurrentUserSelf,
      t,
      isThePersonAdmin,
      isThePersonGuest,
    } = this.props;
    const teamAdminToggleButton = isThePersonAdmin
      ? 'revokeTeamAdmin'
      : 'makeTeamAdmin';
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
              {t('removeFromTeam')}
            </JuiMenuItem>
          )}
          {!isThePersonGuest && (
            <JuiMenuItem
              data-test-automation-id={teamAdminToggleButton}
              onClick={this._toggleTeamAdmin}
            >
              {t(teamAdminToggleButton)}
            </JuiMenuItem>
          )}
        </JuiMenuList>
      </JuiPopoverMenu>
    );
  }
}

const MenuView = withRouter(translate('translations')(MenuViewComponent));

export { MenuView, MenuViewComponent };
