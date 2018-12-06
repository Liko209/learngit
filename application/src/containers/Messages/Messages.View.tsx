/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:42
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { JuiResponsiveLayout } from 'jui/foundation/Layout/Response';
import { ConversationPage } from '@/containers/ConversationPage';
import { LeftRail } from '@/containers/LeftRail';
import { RightRail } from '@/containers/RightRail';

import { MessagesViewProps } from './types';
import { observer } from 'mobx-react';
import { PostListPage } from '../PostListPage';
import { POST_LIST_TYPE } from '../PostListPage/types';
import { MessageRouterChangeHelper } from './helper';

@observer
class MessagesViewComponent extends Component<MessagesViewProps> {
  constructor(props: MessagesViewProps) {
    super(props);
  }

  componentDidMount() {
    const conversationIdOfUrl = this.props.match.params.id;
    conversationIdOfUrl
      ? MessageRouterChangeHelper.goToConversation(conversationIdOfUrl)
      : MessageRouterChangeHelper.goToLastOpenedGroup();
  }

  componentDidUpdate(prevProps: MessagesViewProps) {
    const currentConversationId = this.props.match.params.id;
    const prevConversationId = prevProps.match.params.id;
    if (currentConversationId !== prevConversationId) {
      MessageRouterChangeHelper.updateCurrentConversationId(
        currentConversationId,
      );
    }
  }

  render() {
    const id = this.props.match.params.id;
    const currentConversationId = id ? Number(id) : 0;
    const { isLeftNavOpen } = this.props;
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
            render={props =>
              currentConversationId ? (
                <ConversationPage {...props} groupId={currentConversationId} />
              ) : null
            }
          />
        </Switch>
        {currentConversationId ? <RightRail /> : null}
      </JuiResponsiveLayout>
    );
  }
}

const MessagesView = withRouter(MessagesViewComponent);

export { MessagesView };
