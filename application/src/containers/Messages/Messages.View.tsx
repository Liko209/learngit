/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:42
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { JuiTreeColumnResponse } from 'jui/foundation/Layout/Response/ThreeColumnResponse';
import { ConversationPage } from '@/containers/ConversationPage';
import { LeftRail } from '@/containers/LeftRail';
import { RightRail } from '@/containers/RightRail';

import { MessagesViewProps } from './types';
import { observer } from 'mobx-react';
import { PostListPage } from '../PostListPage';

@observer
class MessagesViewComponent extends Component<MessagesViewProps> {
  constructor(props: MessagesViewProps) {
    super(props);
  }

  async componentDidMount() {
    this.checkUrl(this.props, true);
  }

  componentWillReceiveProps(props: MessagesViewProps) {
    if (props.match.params.id !== this.props.match.params.id) {
      this.checkUrl(props);
    }
  }

  async checkUrl(props: MessagesViewProps, afterMount: boolean = false) {
    const paramId = props.match.params.id;
    if (!paramId && afterMount) {
      const groupId = await this.props.getLastGroupId();
      this.props.history.replace(`/messages/${groupId}`);
      this.props.updateCurrentConversationId(groupId);
      return;
    }
    if (/\d+/.test(paramId)) {
      const id = Number(props.match.params.id);
      this.props.updateCurrentConversationId(id);
      return;
    }
    this.props.updateCurrentConversationId(0);
  }

  render() {
    const { isLeftNavOpen, currentConversationId } = this.props;
    let leftNavWidth = 72;
    if (isLeftNavOpen) {
      leftNavWidth = 200;
    }

    return (
      <JuiTreeColumnResponse tag="conversation" leftNavWidth={leftNavWidth}>
        <LeftRail />
        {currentConversationId ? (
          <ConversationPage groupId={currentConversationId} />
        ) : (
          <PostListPage type={this.props.match.params.id} />
        )}
        <RightRail />
      </JuiTreeColumnResponse>
    );
  }
}

const MessagesView = withRouter(MessagesViewComponent);

export { MessagesView };
