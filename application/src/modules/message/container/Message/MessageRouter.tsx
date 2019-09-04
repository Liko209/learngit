/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:42
 * Copyright © RingCentral. All rights reserved.
 */
import { GlobalStyle } from 'jui/pattern/MessageInput';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiResponsiveLayout,
  VISUAL_MODE,
  withResponsive,
  RIGHT_SHELF_DEFAULT_WIDTH,
  RIGHT_SHELF_MAX_WIDTH,
  RIGHT_SHELF_MIN_WIDTH,
} from 'jui/foundation/Layout/Responsive';
import { JuiConversationLoading } from 'jui/pattern/ConversationLoading';
import {
  goToConversationWithLoading,
  GoToConversationParams,
} from '@/common/goToConversation';
import { ERROR_TYPES } from '@/common/catchError';
import { ConversationPage } from '../ConversationPage';
import { LeftRail } from '../LeftRail';
import { PostListPage } from '../PostListPage';
import { POST_LIST_TYPE } from '../PostListPage/types';
import { RightRail, TriggerButton } from '../RightRail';
import { MessageRouterChangeHelper } from './helper';
import { IMessageService } from '../../interface';

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
  maxWidth: RIGHT_SHELF_MAX_WIDTH,
  minWidth: RIGHT_SHELF_MIN_WIDTH,
  defaultWidth: RIGHT_SHELF_DEFAULT_WIDTH,
  visualMode: VISUAL_MODE.BOTH,
  enable: {
    left: true,
  },
  priority: 3,
});

type State = {
  errorType: ERROR_TYPES | null;
  messageError: boolean;
  retryParams: GoToConversationParams | null;
};

type MessagesWrapperPops = RouteComponentProps<{ subPath: string }>;

type Props = MessagesWrapperPops & WithTranslation;

@observer
class MessageRouterComponent extends Component<Props, State> {
  state: State = {
    messageError: false,
    retryParams: null,
    errorType: null,
  };

  @IMessageService
  private _messageService: IMessageService;

  componentDidMount() {
    const targetConversationId = this.props.match.params.subPath;
    targetConversationId
      ? MessageRouterChangeHelper.goToConversation(
          targetConversationId,
          'REPLACE',
        )
      : MessageRouterChangeHelper.goToLastOpenedGroup();
  }

  componentDidUpdate(prevProps: Props) {
    const subPath = this.props.match.params.subPath;
    const prevSubPath = prevProps.match.params.subPath;
    if (subPath !== prevSubPath) {
      MessageRouterChangeHelper.updateCurrentConversationId(subPath);
    }
  }

  componentWillReceiveProps(props: Props) {
    const { location } = props;
    const { state } = location;

    if (state && state.error) {
      this.setState({
        messageError: true,
        retryParams: state.params,
        errorType: state.errorType,
      });
    }
  }

  private get _getLoadingTip() {
    const { t } = this.props;
    const { retryParams, errorType } = this.state;
    if (!retryParams) {
      return t('message.prompt.MessageLoadingErrorTip');
    }
    if (errorType === ERROR_TYPES.NETWORK) {
      return t('message.prompt.MessageLoadingErrorTipForNetworkIssue');
    }
    if (errorType === ERROR_TYPES.NOT_AUTHORIZED) {
      return t('people.prompt.conversationPrivate');
    }
    if (errorType === ERROR_TYPES.BACKEND) {
      return t('message.prompt.MessageLoadingErrorTipForServerIssue');
    }
    return t('message.prompt.MessageLoadingErrorTip');
  }

  private get _getLoadingLinkText() {
    const { t } = this.props;
    const { retryParams, errorType } = this.state;
    if (!retryParams || errorType === ERROR_TYPES.NOT_AUTHORIZED) {
      return '';
    }
    if (errorType === ERROR_TYPES.NETWORK) {
      return t('common.prompt.thenTryAgain');
    }
    if (errorType === ERROR_TYPES.BACKEND) {
      return t('common.prompt.tryAgainLater');
    }
    return t('common.prompt.tryAgain');
  }

  retryMessage = async () => {
    const { retryParams } = this.state;
    if (retryParams) {
      return goToConversationWithLoading(retryParams);
    }
    return;
  };

  private _renderRouteForMessageConversation = (
    props: RouteComponentProps<{ id: string }>,
  ) => {
    const groupId = +props.match.params.id;
    this._messageService.setLastGroutId(groupId);
    return <ConversationPage {...props} groupId={groupId} />;
  };

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
                tip={this._getLoadingTip}
                linkText={this._getLoadingLinkText}
                onClick={this.retryMessage}
              />
            )}
          />
          <Route
            path={`/messages/${POST_LIST_TYPE.mentions}`}
            render={() => <PostListPage type={POST_LIST_TYPE.mentions} />}
          />
          <Route
            path={`/messages/${POST_LIST_TYPE.bookmarks}`}
            render={() => <PostListPage type={POST_LIST_TYPE.bookmarks} />}
          />
          <Route
            path={'/messages/:id'}
            render={this._renderRouteForMessageConversation}
          />
        </SwitchResponsive>
        <GlobalStyle />
        {MessageRouterChangeHelper.isConversation(match.params.subPath) ? (
          <RightRailResponsive id={Number(match.params.subPath)} />
        ) : null}
      </JuiResponsiveLayout>
    );
  }
}

const MessageRouter = withRouter(
  withTranslation('translations')(MessageRouterComponent),
);

export { MessageRouter };
