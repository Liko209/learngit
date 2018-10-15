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
    const groupId = await this.props.getLastGroupId(conversationIdOfUrl);
    const history = this.props.history;
    this.props.toConversation(history, groupId);
  }

  render() {
    const { isLeftNavOpen, currentConversationId } = this.props;

    let leftNavWidth = 72;
    if (isLeftNavOpen) {
      leftNavWidth = 200;
    }

    return (
      <JuiTreeColumnResponse tag="conversation" leftNavWidth={leftNavWidth}>
        <LeftRail currentGroupId={currentConversationId} />
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
