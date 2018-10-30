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

@observer
class MessagesViewComponent extends Component<MessagesViewProps> {
  constructor(props: MessagesViewProps) {
    super(props);
  }

  async componentDidMount() {
    const conversationIdOfUrl = Number(this.props.match.params.id);
    let groupId;
    if (!conversationIdOfUrl) {
      /* get the last group id */
      groupId = await this.props.getLastGroupId(conversationIdOfUrl);
      this.props.history.replace(`/messages/${groupId}`);
    } else {
      groupId = conversationIdOfUrl;
    }
    this.props.updateCurrentConversationId(groupId);
  }

  componentWillReceiveProps(props: MessagesViewProps) {
    const id = Number(props.match.params.id);
    this.props.updateCurrentConversationId(id);
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
        ) : null}
        <RightRail />
      </JuiTreeColumnResponse>
    );
  }
}

const MessagesView = withRouter(MessagesViewComponent);

export { MessagesView };
