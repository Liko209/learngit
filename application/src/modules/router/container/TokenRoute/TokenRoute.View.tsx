/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-30 14:52:04
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiContentLoader } from 'jui/pattern/ContentLoader';
import { JuiModal } from 'jui/components/Dialog';

type TokenRouteProps = RouteComponentProps<{}> &
  WithTranslation & {
    unifiedLogin: Function;
    redirectToIndex: Function;
    isOffline: boolean;
    isError: boolean;
  };

@observer
class TokenRoute extends Component<TokenRouteProps> {
  constructor(props: TokenRouteProps) {
    super(props);
  }

  async componentDidMount() {
    const { location, history, unifiedLogin } = this.props;
    await unifiedLogin(location, history);
  }

  onClose = () => {
    const { location, history, redirectToIndex } = this.props;
    redirectToIndex(location, history);
  }

  render() {
    const { isOffline, isError, t } = this.props;

    let content = '';
    if (isError) {
      content = t('auth.signInFailedContent');
    }
    if (isOffline) {
      content = t('common.prompt.Network Error');
    }

    return (
      <React.Fragment>
        <JuiModal
          open={isError || isOffline}
          onOK={this.onClose}
          title={t('auth.signInFailedTitle')}
          okText={t('common.dialog.OK')}
          content={content}
        />
        <JuiContentLoader />
      </React.Fragment>
    );
  }
}

const TokenRouteView = withTranslation('translations')(withRouter(TokenRoute));

export { TokenRouteView };
