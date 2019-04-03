/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:42
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import i18next from 'i18next';
import {
  JuiResponsiveLayout,
  VISUAL_MODE,
  withResponsive,
} from 'jui/foundation/Layout/Responsive';
import { JuiConversationLoading } from 'jui/pattern/ConversationLoading';
import {
  goToConversationWithLoading,
  GoToConversationParams,
} from '@/common/goToConversation';
import { ConversationPage } from '@/containers/ConversationPage';
import { LeftRail } from '@/containers/LeftRail';
import { PostListPage } from '@/containers/PostListPage';
import { POST_LIST_TYPE } from '@/containers/PostListPage/types';
import { RightRail, TriggerButton } from '@/containers/RightRail';
import { MessageRouterChangeHelper } from './helper';

const LeftRailResponsive = withResponsive(LeftRail, {
  maxWidth: 360,
  minWidth: 200,
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
  minWidth: 200,
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
      MessageRouterChangeHelper.ensureGroupIsOpened(Number(subPath));
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
    goToConversationWithLoading(retryParams);
  }

  render() {
    const { match } = this.props;
    const { messageError } = this.state;

    return (
      <JuiResponsiveLayout>
        <LeftRailResponsive />
        <SwitchResponsive>
          <Route
            path={'/messages/loading'}
            render={() => (
              <JuiConversationLoading
                showTip={messageError}
                tip={i18next.t('message.prompt.MessageLoadingErrorTip')}
                linkText={i18next.t('common.prompt.tryAgain')}
                onClick={this.retryMessage}
              />
            )}
          />
          <Route
            path={`/messages/${POST_LIST_TYPE.mentions}`}
            render={(props: MessagesWrapperPops) => (
              <PostListPage {...props} type={POST_LIST_TYPE.mentions} />
            )}
          />
          <Route
            path={`/messages/${POST_LIST_TYPE.bookmarks}`}
            render={(props: MessagesWrapperPops) => (
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
        </SwitchResponsive>
        {MessageRouterChangeHelper.isConversation(match.params.subPath) ? (
          <RightRailResponsive id={Number(match.params.subPath)} />
        ) : null}
      </JuiResponsiveLayout>
    );
  }
}

const MessageRouter = withRouter(MessageRouterComponent);

export { MessageRouter };
