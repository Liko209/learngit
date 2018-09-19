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
type IProps = ConversationListItemViewProps & RouteComponentProps;
class ConversationListItemViewComponent extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  renderCloseMenuItem() {
    if (this.props.unreadCount === 0) {
      return <MenuItem onClick={this.props.onCloseClick}>Close</MenuItem>;
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
        <MenuItem onClick={this.props.onFavoriteTogglerClick}>
          {this.props.favoriteText}
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
    console.log(this.props);
    this.props.onClick(event);
    this._jump2Conversation(this.props.id);
  }

  private _jump2Conversation(id: number) {
    const { history } = this.props;
    history.push(`/messages/${id}`);
    // this.navPresenter.handleRouterChange();
    // this.navPresenter.handleTitle(this.displayName);
  }
}
const ConversationListItemView = withRouter(ConversationListItemViewComponent);
export { ConversationListItemView };
