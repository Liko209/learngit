/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:53:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { MouseEvent } from 'react';
import { Menu } from 'ui-components/atoms/Menu';
import { ConversationListItemViewProps } from './types';
import { withRouter, RouteComponentProps } from 'react-router-dom';
// import navPresenter, { NavPresenter } from '../../BackNForward/ViewModel';
import { JuiConversationListItem } from 'jui/pattern/ConversationList';
import { Umi } from '../../Umi';
// TODO remove Stubs here
const Presence = (props: any) => <div {...props} />;
const Indicator = (props: any) => <div {...props} />;
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
  // private navPresenter: NavPresenter;
  constructor(props: IProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
    // this.navPresenter = navPresenter;
    this.state = { currentGroupId: 0 };
  }

  // componentDidMount() {
  //   this.props.history.listen(() => {
  //     const pathname = window.location.pathname;
  //     const uIdIndex = pathname.lastIndexOf('/');
  //     const uid = pathname.slice(uIdIndex + 1);
  //     if (+uid === this.props.groupId) {
  //       this.navPresenter.handleTitle(this.props.displayName);
  //     }
  //   });
  // }

  static getDerivedStateFromProps(props: IProps, state: IState) {
    const currentGroupId = parseInt(props.match.params.id, 10);
    if (currentGroupId !== state.currentGroupId) {
      return { currentGroupId };
    }
    return null;
  }

  private get _umi() {
    return <Umi ids={[this.props.groupId]} />;
  }

  private get _presence() {
    return <Presence id={this.props.groupId} />;
  }
  private get _indicator() {
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
      />
    );
  }

  onClick(event: MouseEvent<HTMLElement>) {
    this.props.onClick(event);
    this._jump2Conversation(this.props.groupId);
  }

  private _jump2Conversation(id: number) {
    const { history, displayName } = this.props;
    history.push(`/messages/${id}`);
    // this.navPresenter.handleRouterChange();
    // this.navPresenter.handleTitle(displayName);
  }
}
const ConversationListItemView = withRouter(ConversationListItemViewComponent);
export { ConversationListItemView };
