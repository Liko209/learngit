/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:53:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { MouseEvent } from 'react';
import { ConversationListItem } from 'ui-components/molecules/ConversationList/ConversationListItem';
import { Menu } from 'ui-components/atoms/Menu';
import { ConversationListItemViewProps } from './types';
import { withRouter, RouteComponentProps } from 'react-router-dom';
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

  static getDerivedStateFromProps(props: IProps, state: IState) {
    const currentGroupId = parseInt(props.match.params.id, 10);
    if (currentGroupId !== state.currentGroupId) {
      return { currentGroupId };
    }
    return null;
  }

  private _Umi() {
    return <Umi ids={[this.props.id]} />;
  }

  private _presence() {
    return <Presence id={this.props.id} />;
  }
  private _Indicator() {
    return <Indicator id={this.props.id} />;
  }

  private _Menu() {
    return (
      <Menu
        id={this.props.id}
        anchorEl={this.props.anchorEl}
        onMenuClose={this.props.onMenuClose}
      />
    );
  }

  render() {
    return (
      <JuiConversationListItem
        presence={this._presence}
        umi={this._Umi}
        statusIndicator={this._Indicator}
        menu={this._Menu}
        onMoreClick={this.props.onMoreClick}
        title={this.props.displayName}
        umiHint={this.props.umiHint}
      />
    );
  }
  // render() {
  //   const { currentGroupId } = this.state;
  //   const showDraftTag = currentGroupId !== this.props.id && !!this.props.draft; // except oneself
  //   return (
  //     <React.Fragment>
  //       <ConversationListItem
  //         aria-owns={open ? 'render-props-menu' : undefined}
  //         aria-haspopup="true"
  //         key={this.props.id}
  //         title={this.props.displayName || ''}
  //         umiHint={this.props.umiHint}
  //         unreadCount={this.props.unreadCount}
  //         umiVariant={this.props.umiVariant}
  //         important={this.props.important}
  //         onMoreClick={this.props.onMoreClick}
  //         onClick={this.onClick}
  //         status={this.props.status}
  //         showDraftTag={showDraftTag}
  //         showSendMsgFailureTag={this.props.sendFailurePostIds.length > 0}
  //       />
  //       {this.renderMenu()}
  //     </React.Fragment>
  //   );
  // }

  onClick(event: MouseEvent<HTMLElement>) {
    this.props.onClick(event);
    this._jump2Conversation(this.props.id);
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
