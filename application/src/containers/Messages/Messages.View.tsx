/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:42
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { t } from 'i18next';
import { observer } from 'mobx-react';
import { Route, Switch, withRouter } from 'react-router-dom';
import {
  JuiResponsiveLayout,
  withResponsive,
  VISUAL_MODE,
} from 'jui/foundation/Layout/Responsive';
import { ConversationPage } from '@/containers/ConversationPage';
import { LeftRail } from '@/containers/LeftRail';
import { RightRail, TriggerButton } from '@/containers/RightRail';
import { JuiConversationLoading } from 'jui/pattern/ConversationLoading';
import {
  goToConversation,
  GoToConversationParams,
} from '@/common/goToConversation';

import { MessagesViewProps } from './types';
import { PostListPage } from '../PostListPage';
import { POST_LIST_TYPE } from '../PostListPage/types';
import { MessageRouterChangeHelper } from './helper';

const LeftRailResponsive = withResponsive(LeftRail, {
  maxWidth: 360,
  minWidth: 180,
  defaultWidth: 268,
  visualMode: VISUAL_MODE.AUTOMATIC,
  enable: {
    right: true,
  },
  priority: 1,
});

const SwitchResponsive = withResponsive(Switch, {
  minWidth: 400,
  priority: 2,
});

const RightRailResponsive = withResponsive(RightRail, {
  TriggerButton,
  maxWidth: 360,
  minWidth: 180,
  defaultWidth: 268,
  visualMode: VISUAL_MODE.BOTH,
  enable: {
    left: true,
  },
  priority: 3,
});

type State = {
  messageError: boolean;
  retryParams: GoToConversationParams | null;
};

@observer
class MessagesViewComponent extends Component<MessagesViewProps, State> {
  state = {
    messageError: false,
    retryParams: null,
  };

  constructor(props: MessagesViewProps) {
    super(props);
  }

  componentDidMount() {
    const { match } = this.props;
    const { id: conversationIdOfUrl } = match.params;

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

  componentWillReceiveProps(props: MessagesViewProps) {
    const { location } = props;
    const { state } = location;

    if (state && state.error) {
      this.setState({
        messageError: true,
        retryParams: state.params,
      });
    }
  }

  retryMessage = () => {
    const { retryParams } = this.state;
    if (!retryParams) return;
    goToConversation(retryParams);
  }

  render() {
    const { messageError } = this.state;
    const id = this.props.match.params.id;

    const currentConversationId = id ? Number(id) : 0;

    return (
      <JuiResponsiveLayout>
        <LeftRailResponsive />
        <SwitchResponsive>
          <Route
            path={'/messages/loading'}
            render={props => (
              <JuiConversationLoading
                showTip={messageError}
                tip={t('messageLoadingErrorTip')}
                linkText={t('tryAgain')}
                onClick={this.retryMessage}
              />
            )}
          />
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
        </SwitchResponsive>
        {currentConversationId ? (
          <RightRailResponsive id={currentConversationId} />
        ) : null}
      </JuiResponsiveLayout>
    );
  }
}

const MessagesView = withRouter(MessagesViewComponent);

export { MessagesView };
