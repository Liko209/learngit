/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-30 14:52:04
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { observer } from 'mobx-react';
import { reaction, IReactionDisposer } from 'mobx';

import { JuiContentLoader } from 'jui/pattern/ContentLoader';
import { JuiModal } from 'jui/components/Dialog';

type TokenRouteProps = RouteComponentProps<{}> &
  InjectedTranslateProps & {
    unifiedLogin: Function;
    redirectToIndex: Function;
    isOffline: boolean;
    isOpen: boolean;
  };

@observer
class TokenRoute extends Component<TokenRouteProps> {
  private _observer: IReactionDisposer;

  constructor(props: TokenRouteProps) {
    super(props);
    this._observer = reaction(
      () => {
        const { isOffline, isOpen } = this.props;
        return { isOffline, isOpen };
      },
      ({ isOffline, isOpen }) => {
        this.showAlert(isOffline, isOpen);
      },
    );
  }

  componentDidMount() {
    const { location, history, unifiedLogin } = this.props;
    unifiedLogin(location, history);
  }

  componentWillUnmount() {
    this._observer();
  }

  onClose = () => {
    const { location, history, redirectToIndex } = this.props;
    redirectToIndex(location, history);
  }

  showAlert(offline: any, open: any) {
    const { t } = this.props;
    if (open) {
      JuiModal.alert(
        {
          header: t('signInFailedTitle'),
          onOK: () => {
            this.onClose();
          },
          children: t(
            offline ? 'signInFailedContentNetwork' : 'signInFailedContent',
          ),
        },
        this,
      );
    }
  }

  render() {
    return (
      <React.Fragment>
        <JuiContentLoader />
      </React.Fragment>
    );
  }
}

const TokenRouteView = translate('login')(withRouter(TokenRoute));

export { TokenRouteView };
