/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 18:56:22
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { t } from 'i18next'; // use external instead of injected due to incompatible with SortableElement
import { JuiMenu, JuiMenuItem } from 'jui/components';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import showDialogWithCheckView from '../../Dialog/DialogWithCheckView';
import { MenuViewProps } from './types';

type Props = MenuViewProps & RouteComponentProps;

@observer
class MenuViewComponent extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this._handleToggleFavorite = this._handleToggleFavorite.bind(this);
    this._handleCloseConversation = this._handleCloseConversation.bind(this);
  }

  renderCloseMenuItem() {
    if (!this.props.umiHint) {
      return (
        <JuiMenuItem onClick={this._handleCloseConversation}>
          {t('conversationMenuItem:close')}
        </JuiMenuItem>
      );
    }
    return null;
  }

  render() {
    const { anchorEl, onClose, favoriteText } = this.props;
    return (
      <JuiMenu
        id="render-props-menu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={onClose}
      >
        <JuiMenuItem onClick={this._handleToggleFavorite}>
          {t(`conversationMenuItem:${favoriteText}`)}
        </JuiMenuItem>
        {this.renderCloseMenuItem()}
      </JuiMenu>
    );
  }

  private _handleToggleFavorite(event: MouseEvent<HTMLElement>) {
    this.props.onClose(event);
    this.props.toggleFavorite();
  }

  private _handleCloseConversation(event: MouseEvent<HTMLElement>) {
    this.props.onClose(event);
    if (this.props.shouldSkipCloseConfirmation) {
      this._closeConversation(true);
    } else {
      showDialogWithCheckView({
        header: t('conversationMenuItem:closeConfirmDialogHeader'),
        content: t('conversationMenuItem:closeConfirmDialogContent'),
        checkBoxContent: t(
          'conversationMenuItem:closeConfirmDialogDontAskMeAgain',
        ),
        okText: t('conversationMenuItem:Close Conversation'),
        onClose: (isChecked: boolean) => {
          this._closeConversation(isChecked);
        },
      });
    }
  }

  private async _closeConversation(shouldSkipNextTime: boolean) {
    const result = await this.props.closeConversation(shouldSkipNextTime);
    if (result === ServiceCommonErrorType.NONE) {
      // jump to section
      const match = /messages\/(\d+)/.exec(window.location.href);
      if (match && this.props.groupId === Number(match[1])) {
        const { history } = this.props;
        history.replace('/messages');
      }
      return;
    }
  }
}

const MenuView = withRouter(MenuViewComponent);

export { MenuView };
