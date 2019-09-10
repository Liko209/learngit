/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 18:56:22
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { withTranslation, WithTranslation } from 'react-i18next'; // use external instead of injected due to incompatible with SortableElement
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiCheckboxLabel } from 'jui/components/Checkbox';
import { JuiTypography } from 'jui/foundation/Typography';
import { Dialog } from '@/containers/Dialog';
import { Notification } from '@/containers/Notification';
import { MenuViewProps } from './types';
import { JuiMenuContain } from 'jui/pattern/ConversationList/ConversationListItem';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { catchError } from '@/common/catchError';
import { dataAnalysis } from 'foundation/analysis';

type Props = MenuViewProps & RouteComponentProps & WithTranslation;

@observer
class MenuViewComponent extends Component<Props> {
  checked: boolean = false;

  moreActionsDataTracking(actionName: string) {
    dataAnalysis.track('Jup_Web/DT_msg_conversationListMoreActions', {
      action: actionName,
    });
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

  _handleResize = (event: UIEvent) => {
    this.props.onClose(event);
  };

  componentDidMount() {
    window.addEventListener('resize', this._handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._handleResize);
  }

  private _getKeyReadOrUnread = () => {
    const { isUnread } = this.props;
    return isUnread ? 'markAsRead' : 'markAsUnread';
  };

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
  };

  private _handleReadOrUnreadConversation = async (
    event: MouseEvent<HTMLElement>,
  ) => {
    const { onClose, toggleRead, isUnread } = this.props;
    try {
      event.stopPropagation();
      onClose(event);
      this.moreActionsDataTracking(isUnread ? 'markAsRead' : 'markAsUnread');
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
  };

  @catchError.flash({
    network: 'people.prompt.notAbleToUnFavoriteForNetworkIssue',
    server: 'people.prompt.notAbleToUnFavoriteForServerIssue',
  })
  private _handleRemoveFavorite = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    this.props.onClose(event);
    this.moreActionsDataTracking('removeFromFavorite');
    return this.props.toggleFavorite();
  };

  @catchError.flash({
    network: 'people.prompt.notAbleToFavoriteThisMessageForNetworkIssue',
    server: 'people.prompt.notAbleToFavoriteThisMessageForServerIssue',
  })
  private _handleFavorite = () => {
    this.moreActionsDataTracking('favorite');
    return this.props.toggleFavorite();
  };

  private _checkboxChange = (
    event: React.ChangeEvent<{}>,
    checked: boolean,
  ) => {
    this.checked = checked;
  };

  private _handleCloseConversation = (event: MouseEvent<HTMLElement>) => {
    const { t } = this.props;
    event.stopPropagation();
    this.props.onClose(event);
    this.moreActionsDataTracking('close');
    if (this.props.shouldSkipCloseConfirmation) {
      this._closeConversationWithoutConfirmDialog();
    } else {
      Dialog.alert({
        modalProps: {
          'data-test-automation-id': 'close-conversation-alert-dialog',
        },
        title: t('people.prompt.closeConfirmDialogHeader'),
        content: (
          <>
            <JuiTypography>
              {t('people.prompt.closeConfirmDialogContent')}
            </JuiTypography>
            <JuiCheckboxLabel
              label={t('people.prompt.closeConfirmDialogDontAskMeAgain')}
              automationId="close-conversation-alert-dont-ask-again"
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
  };

  private async _closeConversationWithConfirm() {
    this._closeConversation(this.checked);
  }

  private async _closeConversationWithoutConfirmDialog() {
    this._closeConversation(true);
  }

  @catchError.flash({
    network: 'people.prompt.notAbleToCloseTheConversationForNetworkIssue',
    server: 'people.prompt.notAbleToCloseTheConversationForServerIssue',
  })
  private async _closeConversation(shouldSkipCloseConfirmation: boolean) {
    await this.props.closeConversation(shouldSkipCloseConfirmation);
    // jump to section
    const match = /messages\/(\d+)/.exec(window.location.href);
    if (match && this.props.groupId === Number(match[1])) {
      const { history } = this.props;
      history.replace('/messages');
    }
  }

  private _onClose = (event: MouseEvent<HTMLElement>) => {
    this.props.onClose(event);
  };

  private _mouseEventHandler = (e: React.TouchEvent | MouseEvent) => {
    e.stopPropagation();
  };

  render() {
    const { anchorEl, favoriteText, t, isFavorite } = this.props;
    return (
      <JuiMenuContain
        id="render-props-menu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={this._onClose}
        onClick={this._mouseEventHandler}
        onTouchStart={this._mouseEventHandler}
        onMouseDown={this._mouseEventHandler}
      >
        {this._renderReadOrUnreadMenuItem()}
        <JuiMenuItem
          data-test-automation-id="favToggler"
          onClick={
            isFavorite ? this._handleRemoveFavorite : this._handleFavorite
          }
        >
          {t(`${favoriteText}`)}
        </JuiMenuItem>
        {this.renderCloseMenuItem()}
      </JuiMenuContain>
    );
  }
}

const MenuView = withRouter(withTranslation('translations')(MenuViewComponent));

export { MenuView, MenuViewComponent };
