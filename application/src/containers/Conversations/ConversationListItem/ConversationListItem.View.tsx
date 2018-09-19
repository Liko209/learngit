/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:53:48
 * Copyright © RingCentral. All rights reserved.
 */
import showAlert from '../../Dialog/ShowAlert';
import React, { MouseEvent } from 'react';
import { ConversationListItem } from 'ui-components/molecules/ConversationList/ConversationListItem';
import { Menu } from 'ui-components/atoms/Menu';
import { MenuItem } from 'ui-components/atoms/MenuItem';
import { ConversationListItemViewProps } from './types';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { t } from 'i18next'; // use external instead of injected due to incompatible with SortableElement
import showDialogWithCheckView from '../../Dialog/DialogWithCheckView';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import navPresenter, { NavPresenter } from '../../Home/NavPresenter';

type IProps = ConversationListItemViewProps & RouteComponentProps;
class ConversationListItemViewComponent extends React.Component<IProps> {
  private navPresenter: NavPresenter;
  constructor(props: IProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
    this.onFavoriteTogglerClick = this.onFavoriteTogglerClick.bind(this);
    this.navPresenter = navPresenter;
  }
  renderCloseMenuItem() {
    if (this.props.unreadCount === 0) {
      return (
        <MenuItem onClick={this.onCloseButtonClick}>
          {t('conversationMenuItem:close')}
        </MenuItem>
      );
    }
    return <React.Fragment />;
  }

  renderMenu() {
    return (
      <Menu
        id="render-props-menu"
        anchorEl={this.props.anchorEl}
        open={this.props.menuOpen}
        onClose={this.props.onMenuClose}
      >
        <MenuItem onClick={this.onFavoriteTogglerClick}>
          {t(`conversationMenuItem:${this.props.favoriteText}`)}
        </MenuItem>
        {this.renderCloseMenuItem()}
      </Menu>
    );
  }

  render() {
    return (
      <React.Fragment>
        <ConversationListItem
          aria-owns={open ? 'render-props-menu' : undefined}
          aria-haspopup="true"
          key={this.props.id}
          title={this.props.displayName || ''}
          unreadCount={this.props.unreadCount}
          umiVariant={this.props.umiVariant}
          onMoreClick={this.props.onMoreClick}
          onClick={this.onClick}
          status={this.props.status}
        />
        {this.renderMenu()}
      </React.Fragment>
    );
  }

  onClick(event: MouseEvent<HTMLElement>) {
    this.props.onClick(event);
    this._jump2Conversation(this.props.id);
  }

  onFavoriteTogglerClick(event: MouseEvent<HTMLElement>) {
    this.props.toggleFavorite();
  }

  onCloseButtonClick(event: MouseEvent<HTMLElement>) {
    this.props.onMenuClose(event);
    if (this.props.shouldSkipCloseConfirmation) {
      this._closeConversation(this.props.id, true);
    } else {
      showDialogWithCheckView({
        header: 'Close Conversation?',
        content:
          'Closing a conversation will remove it from the left pane, but will not delete the contents.',
        checkBoxContent: "Don't ask me again",
        okText: 'Close Conversation',
        onClose: (isChecked: boolean, event: MouseEvent<HTMLElement>) => {
          this._closeConversation(this.props.id, isChecked);
        },
      });
    }
  }

  private async _closeConversation(
    groupId: number,
    shouldSkipNextTime: boolean,
  ) {
    const result = await this.props.closeConversation(
      groupId,
      shouldSkipNextTime,
    );
    this._showErrorAlert(result);
  }

  private _showErrorAlert(error: ServiceCommonErrorType) {
    if (error === ServiceCommonErrorType.NONE) {
      // jump to section
      const { history } = this.props;
      history.replace('/messages');
      return;
    }
    const header = 'Close Conversation Failed';
    if (error === ServiceCommonErrorType.NETWORK_NOT_AVAILABLE) {
      const content =
        'Network disconnected. Please try again when the network is resumed.';
      showAlert({ header, content });
    } else if (
      error === ServiceCommonErrorType.SERVER_ERROR ||
      error === ServiceCommonErrorType.UNKNOWN_ERROR
    ) {
      const content =
        'We are having trouble closing the conversation. Please try again later.';
      showAlert({ header, content });
    }
  }

  private _jump2Conversation(id: number) {
    const { history, displayName } = this.props;
    history.push(`/messages/${id}`);
    this.navPresenter.handleRouterChange();
    this.navPresenter.handleTitle(displayName);
  }
}
const ConversationListItemView = withRouter(ConversationListItemViewComponent);
export { ConversationListItemView };
