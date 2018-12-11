/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:42
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { t } from 'i18next';
import { observer } from 'mobx-react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { JuiResponsiveLayout } from 'jui/foundation/Layout/Response';
import { ConversationPage } from '@/containers/ConversationPage';
import { LeftRail } from '@/containers/LeftRail';
import { RightRail } from '@/containers/RightRail';
import { JuiConversationLoading } from 'jui/pattern/ConversationLoading';
import { goToConversation } from '@/common/goToConversation';

import { MessagesViewProps } from './types';
import { PostListPage } from '../PostListPage';
import { POST_LIST_TYPE } from '../PostListPage/types';

type State = {
  messageError: boolean;
  retryId: number | null;
};

@observer
class MessagesViewComponent extends Component<MessagesViewProps, State> {
  state = {
    messageError: false,
    retryId: null,
  };

  constructor(props: MessagesViewProps) {
    super(props);
  }

  async componentDidMount() {
    const { match, location } = this.props;
    const { id: conversationIdOfUrl } = match.params;

    if (location.state && location.state.waiting) {
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
    const { updateCurrentConversationId } = this.props;
    const { match, location } = props;
    const { state } = location;

    if (state && state.error) {
      this.setState({
        messageError: true,
        retryId: state.conversationId,
      });
    }

    updateCurrentConversationId(match.params.id);
  }

  retryMessage = () => {
    const { retryId } = this.state;
    if (!retryId) return;
    goToConversation(retryId);
  }

  render() {
    const { messageError } = this.state;
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
              <JuiConversationLoading
                showTip={messageError}
                tip={t('messageLoadingErrorTip')}
                linkText={t('tryAgain')}
                onClick={this.retryMessage}
              />
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
