/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-08 18:38:42
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Route, withRouter } from 'react-router-dom';
import { JuiConversationLoading } from 'jui/pattern/ConversationLoading';
import { service, GLIP_LOGIN_STATUS } from 'sdk';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { withTranslation, WithTranslation } from 'react-i18next';

import { MessageRouter } from './MessageRouter';
import { MessageViewProps } from './types';

type Props = MessageViewProps & WithTranslation;
type State = {
  success: boolean;
  initializing: boolean;
};
@observer
class MessageComponent extends Component<Props, State> {
  accountService = ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  );

  state = {
    initializing:
      this.accountService.getGlipLoginStatus() === GLIP_LOGIN_STATUS.PROCESS,
    success:
      this.accountService.getGlipLoginStatus() === GLIP_LOGIN_STATUS.SUCCESS,
  };

  constructor(props: Props) {
    super(props);
    const { notificationCenter, SERVICE } = service;
    notificationCenter.on(SERVICE.GLIP_LOGIN, (success: boolean) => {
      this.setState({
        success,
        initializing: false,
      });
    });
  }

  tryAgain = () => {
    this.setState({
      initializing: true,
    });

    this.accountService.startLoginGlip();
  };

  render() {
    const { success, initializing } = this.state;
    const { t } = this.props;
    if (success) {
      return (
        <Route
          path={`${this.props.match.path}/:subPath?`}
          component={MessageRouter}
        />
      );
    }
    return (
      <JuiConversationLoading
        tip={t(
          initializing
            ? 'message.initialization.initializing'
            : 'message.initialization.failure',
        )}
        linkText={initializing ? '' : t('message.initialization.tryAgain')}
        showTip
        onClick={this.tryAgain}
      />
    );
  }
}

const Message = withRouter(withTranslation('translations')(MessageComponent));

export { Message };
