/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:42
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { JuiTreeColumnResponse } from 'jui/foundation/Layout/Response/ThreeColumnResponse';
import { ConversationPage } from '@/containers/ConversationPage';
import { LeftRail } from '@/containers/LeftRail';
import { RightRail } from '@/containers/RightRail';

import { MessagesViewProps } from './types';
import { observer } from 'mobx-react';
import { PostListPage } from '../PostListPage';
import { POST_LIST_TYPE } from '../PostListPage/types';

@observer
class MessagesViewComponent extends Component<MessagesViewProps> {
  constructor(props: MessagesViewProps) {
    super(props);
  }

  async componentDidMount() {
    const conversationIdOfUrl = this.props.match.params.id;
    let groupId;
    if (!conversationIdOfUrl) {
      groupId = await this.props.getLastGroupId();
      this.props.history.replace(`/messages/${groupId || ''}`);
    } else {
      groupId = conversationIdOfUrl;
    }
    this.props.updateCurrentConversationId(groupId);
  }

  componentWillReceiveProps(props: MessagesViewProps) {
    this.props.updateCurrentConversationId(props.match.params.id);
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
        <Switch>
          <Route
            path={`/messages/${POST_LIST_TYPE.mentions}`}
            render={props => (
              <PostListPage {...props} type={POST_LIST_TYPE.mentions} />
            )}
          />
          <Route
            path="/messages/:id?"
            render={props => (
              <ConversationPage {...props} groupId={currentConversationId} />
            )}
          />
        </Switch>
        {currentConversationId ? <RightRail /> : null}
      </JuiTreeColumnResponse>
    );
  }
}

const MessagesView = withRouter(MessagesViewComponent);

export { MessagesView };
