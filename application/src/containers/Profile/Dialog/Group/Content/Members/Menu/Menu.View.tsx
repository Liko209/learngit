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
import { JuiMenuList, JuiMenuItem } from 'jui/components';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import { MenuViewProps } from './types';
import { JuiIconography } from 'jui/foundation/Iconography';
import { Notification } from '@/containers/Notification';
import { errorHelper } from 'sdk/error';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

type Props = MenuViewProps & RouteComponentProps & WithTranslation;
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

  private _renderFlashToast = (message: string) => {
    Notification.flashToast({
      message,
      type: ToastType.ERROR,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  }

  private _containErrorHander = async (
    serviceFunction: Function,
    [networkError, backendError]: string[],
  ) => {
    try {
      await serviceFunction();
      return true;
    } catch (error) {
      if (errorHelper.isNetworkConnectionError(error)) {
        this._renderFlashToast(networkError);
        return false;
      }
      if (errorHelper.isBackEndError(error)) {
        this._renderFlashToast(backendError);
        return false;
      }
      throw error;
    }
  }

  private _handleRemoveFromTeam = async (event: MouseEvent<HTMLElement>) => {
    event && event.stopPropagation();
    const { onMenuClose, removeFromTeam } = this.props;
    onMenuClose();
    this._containErrorHander(removeFromTeam, [
      'people.prompt.removeMemberNetworkError',
      'people.prompt.removeMemberBackendError',
    ]);
  }

  private _toggleTeamAdmin = (event: MouseEvent<HTMLElement>) => {
    event && event.stopPropagation();
    const { onMenuClose, toggleTeamAdmin, isThePersonAdmin } = this.props;
    onMenuClose();
    const errorList = isThePersonAdmin
      ? [
        'people.prompt.revokeTeamAdminNetworkError',
        'people.prompt.revokeTeamAdminBackendError',
      ]
      : [
        'people.prompt.makeTeamAdminNetworkError',
        'people.prompt.makeTeamAdminBackendError',
      ];
    this._containErrorHander(toggleTeamAdmin, errorList);
  }

  private _Anchor = () => {
    return (
      <JuiIconography data-test-automation-id="moreIcon" iconSize="small">
        more_horiz
      </JuiIconography>
    );
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
