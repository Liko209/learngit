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
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { OpenProfileDialog } from '@/containers/common/OpenProfileDialog';

type Props = MenuViewProps & RouteComponentProps & WithNamespaces;

@observer
class MenuViewComponent extends Component<Props> {
  checked: boolean = false;

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

  _handleResize = (event: UIEvent) => {
    this.props.onClose(event);
  }

  componentDidMount() {
    window.addEventListener('resize', this._handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._handleResize);
  }

  private _getKeyReadOrUnread = () => {
    const { isUnread } = this.props;
    return isUnread ? 'markAsRead' : 'markAsUnread';
  }

  private _renderReadOrUnreadMenuItem = () => {
    const { t, disabledReadOrUnread } = this.props;
    return (
      <JuiMenuItem
        data-test-automation-id="readOrUnreadConversation"
        onClick={this._handleReadOrUnreadConversation}
        disabled={disabledReadOrUnread}
      >
        {t(`people.team.${this._getKeyReadOrUnread()}`)}
      </JuiMenuItem>
    );
  }

  private _handleReadOrUnreadConversation = async (
    event: MouseEvent<HTMLElement>,
  ) => {
    const { onClose, toggleRead } = this.props;
    try {
      event.stopPropagation();
      onClose(event);
      await toggleRead();
    } catch {
      const message = `people.prompt.${this._getKeyReadOrUnread()}`;
      Notification.flashToast({
        message,
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      });
    }
  }

  private _handleToggleFavorite = async (event: MouseEvent<HTMLElement>) => {
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

  private _checkboxChange = (
    event: React.ChangeEvent<{}>,
    checked: boolean,
  ) => {
    this.checked = checked;
  }

  private _handleCloseConversation = (event: MouseEvent<HTMLElement>) => {
    const { t } = this.props;
    event.stopPropagation();
    this.props.onClose(event);
    if (this.props.shouldSkipCloseConfirmation) {
      this._closeConversationWithoutConfirmDialog();
    } else {
      Dialog.alert({
        title: t('people.prompt.closeConfirmDialogHeader'),
        content: (
          <>
            <JuiTypography>
              {t('people.prompt.closeConfirmDialogContent')}
            </JuiTypography>
            <JuiCheckboxLabel
              label={t('people.prompt.closeConfirmDialogDontAskMeAgain')}
              checked={this.checked}
              handleChange={this._checkboxChange}
            />
          </>
        ),
        okText: t('people.team.close'),
        cancelText: t('common.dialog.cancel'),
        okVariant: 'contained',
        okType: 'primary',
        onOK: () => {
          this._closeConversationWithConfirm();
        },
      });
    }
  }

  private async _closeConversationWithConfirm() {
    this._closeConversation(this.checked);
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

  private _onClose = (event: MouseEvent<HTMLElement>) => {
    this.props.onClose(event);
  }

  render() {
    const {
      personId,
      groupId,
      anchorEl,
      onClose,
      favoriteText,
      t,
    } = this.props;
    return (
      <JuiMenu
        id="render-props-menu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={this._onClose}
      >
        {this._renderReadOrUnreadMenuItem()}
        <JuiMenuItem
          data-test-automation-id="favToggler"
          onClick={this._handleToggleFavorite}
        >
          {t(`${favoriteText}`)}
        </JuiMenuItem>
        <OpenProfileDialog id={personId || groupId} beforeClick={onClose}>
          <JuiMenuItem data-test-automation-id="profileEntry">
            {t('people.team.profile')}
          </JuiMenuItem>
        </OpenProfileDialog>
        {this.renderCloseMenuItem()}
      </JuiMenu>
    );
  }
}

const MenuView = withRouter(translate('translations')(MenuViewComponent));

export { MenuView, MenuViewComponent };
