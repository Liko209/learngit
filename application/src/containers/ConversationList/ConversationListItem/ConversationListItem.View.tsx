/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-19 13:53:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { MouseEvent, Fragment } from 'react';
import { JuiConversationListItem } from 'jui/pattern/ConversationList';
import { Umi } from '@/containers/Umi';
import { Indicator } from '@/containers/ConversationList/Indicator';
import { Presence } from '@/containers/Presence';
import { CONVERSATION_TYPES } from '@/constants';
import { Menu } from '../Menu';
import { ConversationListItemViewProps } from './types';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

// TODO remove Stubs here
// const Presence = (props: any) => <span {...props} />;

type Props = ConversationListItemViewProps;
interface IState {
  currentGroupId: number;
}

@observer
class ConversationListItemViewComponent extends React.Component<Props, IState> {
  @observable
  menuAnchorEl: HTMLElement | null = null;

  private _handleTypes = [
    CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
    CONVERSATION_TYPES.ME,
  ];

  constructor(props: Props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
    this._handleMoreClick = this._handleMoreClick.bind(this);
    this._closeMenu = this._closeMenu.bind(this);
  }

  private get _umi() {
    return <Umi ids={[this.props.groupId]} />;
  }

  private get _presence() {
    const { groupType } = this.props;
    return this._handleTypes.includes(groupType) ? (
      <Presence uid={this.props.personIdForPresence} />
    ) : null;
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
          className="conversation-list-item"
          data-group-id={this.props.groupId}
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
  }

  private _handleMoreClick(event: React.MouseEvent<HTMLElement>) {
    event.stopPropagation();
    this.menuAnchorEl = event.currentTarget;
  }

  private _closeMenu() {
    this.menuAnchorEl = null;
  }
}

const ConversationListItemView = ConversationListItemViewComponent;
export { ConversationListItemView };
