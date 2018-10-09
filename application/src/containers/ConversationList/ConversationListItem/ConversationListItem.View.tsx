/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:53:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { MouseEvent } from 'react';
import { ConversationListItemViewProps } from './types';
import { withRouter, RouteComponentProps } from 'react-router-dom';
// import navPresenter, { NavPresenter } from '../../BackNForward/ViewModel';
import { JuiConversationListItem } from 'jui/pattern/ConversationList';
import { Umi } from '@/containers/Umi';
import { Indicator } from '@/containers/ConversationList/Indicator';
// TODO remove Stubs here
const Presence = (props: any) => <div {...props} />;
const Menu = (props: any) => <div {...props} />;

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
  private _umiIds: number[];
  constructor(props: IProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.state = { currentGroupId: 0 };
    this._umiIds = [this.props.groupId];
  }

  private get _umi() {
    return <Umi ids={this._umiIds} />;
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
      <JuiConversationListItem
        presence={this._presence}
        umi={this._umi}
        indicator={this._indicator}
        onMoreClick={this.props.onMoreClick}
        onClick={this.onClick}
        title={this.props.displayName}
        selected={this.props.selected}
      />
    );
  }

  onClick(event: MouseEvent<HTMLElement>) {
    this.props.onClick(event);
    this._jump2Conversation(this.props.groupId);
  }

  private _jump2Conversation(id: number) {
    const { history } = this.props;
    history.push(`/messages/${id}`);
  }
}

const ConversationListItemView = withRouter(ConversationListItemViewComponent);
export { ConversationListItemView };
