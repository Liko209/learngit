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
import { Notification } from '@/containers/Notification';
import { errorHelper } from 'sdk/error';

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

  private _renderFlashToast = (message: string) => {
    Notification.flashToast({
      message,
      type: 'error',
      messageAlign: 'left',
      fullWidth: false,
      dismissible: false,
    });
  }

  private _handleRemoveFromTeam = async (event: MouseEvent<HTMLElement>) => {
    event && event.stopPropagation();
    const { onMenuClose, removeFromTeam } = this.props;
    onMenuClose();
    try {
      await removeFromTeam();
      return true;
    } catch (error) {
      if (errorHelper.isNetworkConnectionError(error)) {
        this._renderFlashToast('removeMemberNetworkError');
        return false;
      }
      if (errorHelper.isBackEndError(error)) {
        this._renderFlashToast('removeMemberBackendError');
        return false;
      }
      throw error;
    }
  }

  private _Anchor = () => {
    return (
      <JuiIconography data-test-automation-id="moreIcon" fontSize="small">
        more_horiz
      </JuiIconography>
    );
  }

  private _onClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    this.props.onMenuClose();
  }
  render() {
    const { isCurrentUserSelf, t } = this.props;
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
        </JuiMenuList>
      </JuiPopoverMenu>
    );
  }
}

const MenuView = withRouter(translate('translations')(MenuViewComponent));

export { MenuView, MenuViewComponent };
