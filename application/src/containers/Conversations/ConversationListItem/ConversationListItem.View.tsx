/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:53:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { MouseEvent } from 'react';
import { ConversationListItem } from 'ui-components/molecules/ConversationList/ConversationListItem';
import { Menu } from 'ui-components/atoms/Menu';
import { MenuItem } from 'ui-components/atoms/MenuItem';
import { ConversationListItemViewProps } from './types';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { t } from 'i18next'; // use external instead of injected due to incompatible with SortableElement
import showDialogWithCheckView from '../../Dialog/DialogWithCheckView';
import ServiceCommonErrorType from 'sdk/service/errors/ServiceCommonErrorType';
import navPresenter, { NavPresenter } from '../../BackNForward/ViewModel';

type IRouterParams = {
  id: string;
};

type IProps = RouteComponentProps<IRouterParams> &
  ConversationListItemViewProps;
interface IState {
  currentGroupId: number;
}

class ConversationListItemViewComponent extends React.Component<
  IProps,
  IState
> {
  private navPresenter: NavPresenter;
  constructor(props: IProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
    this.onFavoriteTogglerClick = this.onFavoriteTogglerClick.bind(this);
    this.navPresenter = navPresenter;
    this.state = { currentGroupId: 0 };
  }
  componentDidMount() {
    this.props.history.listen(() => {
      const pathname = window.location.pathname;
      const uIdIndex = pathname.lastIndexOf('/');
      const uid = pathname.slice(uIdIndex + 1);
      if (+uid === this.props.id) {
        this.navPresenter.handleTitle(this.props.displayName);
      }
    });
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
  static getDerivedStateFromProps(props: IProps, state: IState) {
    const currentGroupId = parseInt(props.match.params.id, 10);
    if (currentGroupId !== state.currentGroupId) {
      return { currentGroupId };
    }
    return null;
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
    const { currentGroupId } = this.state;
    const showDraftTag = currentGroupId !== this.props.id && !!this.props.draft; // except oneself
    return (
      <React.Fragment>
        <ConversationListItem
          aria-owns={open ? 'render-props-menu' : undefined}
          aria-haspopup="true"
          key={this.props.id}
          title={this.props.displayName || ''}
          umiHint={this.props.umiHint}
          unreadCount={this.props.unreadCount}
          umiVariant={this.props.umiVariant}
          important={this.props.important}
          onMoreClick={this.props.onMoreClick}
          onClick={this.onClick}
          status={this.props.status}
          showDraftTag={showDraftTag}
          showSendMsgFailureTag={this.props.sendFailurePostIds.length > 0}
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
      this._closeConversation(true);
    } else {
      showDialogWithCheckView({
        header: t('conversationMenuItem:closeConfirmDialogHeader'),
        content: t('conversationMenuItem:closeConfirmDialogContent'),
        checkBoxContent: t(
          'conversationMenuItem:closeConfirmDialogDontAskMeAgain',
        ),
        okText: t('conversationMenuItem:Close Conversation'),
        onClose: (isChecked: boolean, event: MouseEvent<HTMLElement>) => {
          this._closeConversation(isChecked);
        },
      });
    }
  }

  private async _closeConversation(shouldSkipNextTime: boolean) {
    const result = await this.props.closeConversation(shouldSkipNextTime);
    this._handleResult(result);
  }

  private _handleResult(error: ServiceCommonErrorType) {
    if (error === ServiceCommonErrorType.NONE) {
      // jump to section
      const match = /messages\/(\d+)/.exec(window.location.href);
      if (match && this.props.id === Number(match[1])) {
        const { history } = this.props;
        history.replace('/messages');
      }
      return;
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
