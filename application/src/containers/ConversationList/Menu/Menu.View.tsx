/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 18:56:22
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { translate, WithNamespaces } from 'react-i18next'; // use external instead of injected due to incompatible with SortableElement
import { JuiMenu, JuiMenuItem } from 'jui/components';
import { JuiCheckboxLabel } from 'jui/components/Checkbox';
import { JuiTypography } from 'jui/foundation/Typography';
import { Dialog } from '@/containers/Dialog';
import { Notification } from '@/containers/Notification';
import { MenuViewProps } from './types';
import {
  ProfileDialogGroup,
  ProfileDialogPerson,
} from '@/containers/Profile/Dialog';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

type Props = MenuViewProps & RouteComponentProps & WithNamespaces;
type State = {
  checked: boolean;
};
@observer
class MenuViewComponent extends Component<Props, State> {
  state = {
    checked: false,
  };

  constructor(props: Props) {
    super(props);
    this._handleToggleFavorite = this._handleToggleFavorite.bind(this);
    this._handleCloseConversation = this._handleCloseConversation.bind(this);
    this._checkboxChange = this._checkboxChange.bind(this);
  }

  renderCloseMenuItem() {
    const { t, closable } = this.props;
    return (
      <JuiMenuItem
        data-test-automation-id="closeConversation"
        onClick={this._handleCloseConversation}
        disabled={!closable}
      >
        {t('people.team.close')}
      </JuiMenuItem>
    );
  }

  private async _handleToggleFavorite(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
    const { isFavorite } = this.props;
    this.props.onClose(event);
    try {
      await this.props.toggleFavorite();
    } catch {
      const message = isFavorite
        ? 'people.prompt.markUnFavoriteServerErrorContent'
        : 'people.prompt.markFavoriteServerErrorContent';

      Notification.flashToast({
        message,
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      });
    }
  }

  private _checkboxChange(event: React.ChangeEvent<{}>, checked: boolean) {
    this.setState({
      checked,
    });
  }

  private _handleCloseConversation(event: MouseEvent<HTMLElement>) {
    const { t } = this.props;
    event.stopPropagation();
    this.props.onClose(event);
    if (this.props.shouldSkipCloseConfirmation) {
      this._closeConversationWithoutConfirmDialog();
    } else {
      this.setState({
        checked: false,
      });
      Dialog.alert({
        title: t('people.prompt.closeConfirmDialogHeader'),
        content: (
          <>
            <JuiTypography>
              {t('people.prompt.closeConfirmDialogContent')}
            </JuiTypography>
            <JuiCheckboxLabel
              label={t('people.prompt.closeConfirmDialogDontAskMeAgain')}
              checked={false}
              handleChange={this._checkboxChange}
            />
          </>
        ),
        okText: t('people.prompt.closeConversation'),
        okVariant: 'text',
        onOK: () => {
          this._closeConversationWithConfirm();
        },
      });
    }
  }

  private async _closeConversationWithConfirm() {
    const { checked } = this.state;
    this._closeConversation(checked);
  }

  private async _closeConversationWithoutConfirmDialog() {
    this._closeConversation(true);
  }

  private async _closeConversation(shouldSkipCloseConfirmation: boolean) {
    try {
      await this.props.closeConversation(shouldSkipCloseConfirmation);
      // jump to section
      const match = /messages\/(\d+)/.exec(window.location.href);
      if (match && this.props.groupId === Number(match[1])) {
        const { history } = this.props;
        history.replace('/messages');
      }
    } catch {
      Notification.flashToast({
        message: 'people.prompt.SorryWeWereNotAbleToCloseTheConversation',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      });
    }
  }

  private _handleProfileDialog = (event: MouseEvent<HTMLElement>) => {
    this.props.onClose(event);
    const { personId, groupId } = this.props;
    let ProfileDialog = ProfileDialogGroup;
    let id = groupId;
    if (personId) {
      ProfileDialog = ProfileDialogPerson;
      id = personId;
    }
    Dialog.simple(<ProfileDialog id={id} />, {
      size: 'medium',
    });
  }
  render() {
    const { anchorEl, onClose, favoriteText, t } = this.props;
    return (
      <JuiMenu
        id="render-props-menu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={onClose}
      >
        <JuiMenuItem
          data-test-automation-id="favToggler"
          onClick={this._handleToggleFavorite}
        >
          {t(`${favoriteText}`)}
        </JuiMenuItem>
        <JuiMenuItem
          data-test-automation-id="profileEntry"
          onClick={this._handleProfileDialog}
        >
          {t('people.team.profile')}
        </JuiMenuItem>
        {this.renderCloseMenuItem()}
      </JuiMenu>
    );
  }
}

const MenuView = withRouter(translate('translations')(MenuViewComponent));

export { MenuView, MenuViewComponent };
