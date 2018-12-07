/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:42
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { JuiResponsiveLayout } from 'jui/foundation/Layout/Response';
import { ConversationPage } from '@/containers/ConversationPage';
import { LeftRail } from '@/containers/LeftRail';
import { RightRail } from '@/containers/RightRail';
import { JuiConversationLoading } from 'jui/pattern/ConversationLoading';

import { MessagesViewProps } from './types';
import { PostListPage } from '../PostListPage';
import { POST_LIST_TYPE } from '../PostListPage/types';

@observer
class MessagesViewComponent extends Component<MessagesViewProps> {
  constructor(props: MessagesViewProps) {
    super(props);
  }

  async componentDidMount() {
    const { id: conversationIdOfUrl } = this.props.match.params;
    const { waiting } = this.props.location.state;

    if (waiting) {
      return;
    }

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
      <JuiResponsiveLayout
        tag="conversation"
        leftNavWidth={leftNavWidth}
        mainPanelIndex={1}
      >
        <LeftRail />
        <Switch>
          <Route
            path={`/messages/${POST_LIST_TYPE.mentions}`}
            render={props => (
              <PostListPage {...props} type={POST_LIST_TYPE.mentions} />
            )}
          />
          <Route
            path={`/messages/${POST_LIST_TYPE.bookmarks}`}
            render={props => (
              <PostListPage {...props} type={POST_LIST_TYPE.bookmarks} />
            )}
          />
          <Route
            path="/messages/:id"
            render={props => (
              <ConversationPage {...props} groupId={currentConversationId} />
            )}
          />
          <Route
            path={'/messages'}
            render={props => (
              <JuiConversationLoading tip="" linkText="" onClick={() => {}} />
            )}
          />
        </Switch>
        {currentConversationId ? <RightRail /> : null}
      </JuiResponsiveLayout>
    );
  }
}

const MessagesView = withRouter(MessagesViewComponent);

export { MessagesView };
