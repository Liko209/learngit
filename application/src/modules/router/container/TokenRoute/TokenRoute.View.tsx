/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-30 14:52:04
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { translate, WithNamespaces } from 'react-i18next';
import { observer } from 'mobx-react';
import { JuiContentLoader } from 'jui/pattern/ContentLoader';
import { Dialog } from '@/containers/Dialog';

type TokenRouteProps = RouteComponentProps<{}> &
  WithNamespaces & {
    unifiedLogin: Function;
    redirectToIndex: Function;
    isOffline: boolean;
    isError: boolean;
  };

@observer
class TokenRoute extends Component<TokenRouteProps> {
  private _alert: { dismiss: () => void };

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

  showAlert = ({
    isOffline,
    isError,
  }: {
    isOffline?: boolean;
    isError?: boolean;
  }) => {
    const { t } = this.props;
    let content = '';
    if (isError) {
      content = t('signInFailedContent');
    }
    if (isOffline) {
      content = t('Network Error');
    }
    if (content) {
      if (this._alert) {
        this._alert.dismiss();
      }
      this._alert = Dialog.alert({
        content,
        title: t('signInFailedTitle'),
        onOK: () => {
          this.onClose();
        },
      });
    }
  }

  render() {
    const { isOffline, isError } = this.props;
    return (
      <React.Fragment>
        <JuiContentLoader />
        {this.showAlert({ isOffline, isError })}
      </React.Fragment>
    );
  }
}

const TokenRouteView = translate('translations')(withRouter(TokenRoute));

export { TokenRouteView };
