/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:53:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { MouseEvent, Fragment } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { JuiConversationListItem } from 'jui/pattern/ConversationList';
import { Umi } from '@/containers/Umi';
import { Indicator } from '@/containers/ConversationList/Indicator';
import { Menu } from '../Menu';
import { ConversationListItemViewProps } from './types';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

// TODO remove Stubs here
const Presence = (props: any) => <span {...props} />;

type IRouterParams = {
  id: string;
};

type IProps = RouteComponentProps<IRouterParams> &
  ConversationListItemViewProps;
interface IState {
  currentGroupId: number;
}

@observer
class ConversationListItemViewComponent extends React.Component<
  IProps,
  IState
> {
  @observable
  menuAnchorEl: HTMLElement | null = null;

  constructor(props: IProps) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
    this._handleMoreClick = this._handleMoreClick.bind(this);
    this._closeMenu = this._closeMenu.bind(this);
    this.state = { currentGroupId: 0 };
  }

  private get _umi() {
    return <Umi ids={[this.props.groupId]} />;
  }

  private get _presence() {
    return <Presence id={this.props.groupId} />;
  }
  private get _indicator() {
    if (this.props.selected) {
      return null;
    }
    return <Indicator id={this.props.groupId} />;
  }

  render() {
    return (
      <Fragment>
        <JuiConversationListItem
          presence={this._presence}
          umi={this._umi}
          umiHint={this.props.umiHint}
          indicator={this._indicator}
          onMoreClick={this._handleMoreClick}
          onClick={this._handleClick}
          title={this.props.displayName}
          selected={this.props.selected}
        />
        <Menu
          groupId={this.props.groupId}
          anchorEl={this.menuAnchorEl}
          onClose={this._closeMenu}
        />
      </Fragment>
    );
  }

  private _handleClick(event: MouseEvent<HTMLElement>) {
    this.props.onClick(event);
    this._jump2Conversation(this.props.groupId);
  }

  private _jump2Conversation(id: number) {
    const { history } = this.props;
    history.push(`/messages/${id}`);
  }

  private _handleMoreClick(event: React.MouseEvent<HTMLElement>) {
    event.stopPropagation();
    this.menuAnchorEl = event.currentTarget;
  }

  private _closeMenu() {
    this.menuAnchorEl = null;
  }
}

const ConversationListItemView = withRouter(ConversationListItemViewComponent);
export { ConversationListItemView };
