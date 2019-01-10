/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:42
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import {
  Route,
  Switch,
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { t } from 'i18next';
import { JuiConversationLoading } from 'jui/pattern/ConversationLoading';
import {
  goToConversation,
  GoToConversationParams,
} from '@/common/goToConversation';
import { LeftRail } from '@/containers/LeftRail';
import { ConversationPage } from '@/containers/ConversationPage';
import { PostListPage } from '@/containers/PostListPage';
import { POST_LIST_TYPE } from '@/containers/PostListPage/types';
import { RightRail } from '@/containers/RightRail';
import { MessageLayout } from '../MessageLayout/MessageLayout';
import { MessageRouterChangeHelper } from './helper';

type State = {
  messageError: boolean;
  retryParams: GoToConversationParams | null;
};

type MessagesWrapperPops = RouteComponentProps<{ subPath: string }>;

@observer
class MessageRouterComponent extends Component<MessagesWrapperPops, State> {
  state = {
    messageError: false,
    retryParams: null,
  };

  componentDidMount() {
    const targetConversationId = this.props.match.params.subPath;
    targetConversationId
      ? MessageRouterChangeHelper.goToConversation(targetConversationId)
      : MessageRouterChangeHelper.goToLastOpenedGroup();
  }

  componentDidUpdate(prevProps: MessagesWrapperPops) {
    const subPath = this.props.match.params.subPath;
    const prevSubPath = prevProps.match.params.subPath;

    if (subPath !== prevSubPath) {
      MessageRouterChangeHelper.updateCurrentConversationId(subPath);
    }
  }

  componentWillReceiveProps(props: MessagesWrapperPops) {
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
    const { match } = this.props;
    const { messageError } = this.state;

    return (
      <MessageLayout>
        <LeftRail />
        <Switch>
          <Route
            path={'/messages/loading'}
            render={() => (
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
            path={'/messages/:id'}
            render={(props: RouteComponentProps<{ id: string }>) => (
              <ConversationPage
                {...props}
                groupId={Number(props.match.params.id)}
              />
            )}
          />
        </Switch>
        {MessageRouterChangeHelper.isConversation(match.params.subPath) ? (
          <RightRail id={Number(match.params.subPath)} />
        ) : null}
      </MessageLayout>
    );
  }
}

const MessageRouter = withRouter(MessageRouterComponent);

export { MessageRouter };
