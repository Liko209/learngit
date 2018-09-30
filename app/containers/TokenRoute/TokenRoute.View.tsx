// /*
//  * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
//  * @Date: 2018-09-30 10:25:03
//  * Copyright © RingCentral. All rights reserved.
//  */

// import React from 'react';
// import {
//   Route,
//   RouteComponentProps,
//   RouteProps,
// } from 'react-router-dom';
// import { parse } from 'qs';

// const TokenRouteView: React.StatelessComponent<
//   RouteProps
// > = ({ component, ...rest }) => {
//   const params = parse(window.location.search, { ignoreQueryPrefix: true });
//   if (params.code || params.id_token) {
//     // RC User
//     // http://localhost:3000/?state=STATE&code=CODE
//     // Glip User (Free User)
//     // http://localhost:3000/?state=STATE&id_token=TOKEN
//     return <Route {...rest} component={TokenGetter} />;
//   }
// };

// export { TokenRouteView };

/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:36:33
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

  componentDidMount() {
    // RC User
    // http://localhost:3000/?state=STATE&code=CODE
    // Free User (Glip create a new user)
    // http://localhost:3000/?state=STATE&id_token=TOKEN
    const { location, history, unifiedLogin, isOffline, isOpen } = this.props;
    unifiedLogin(location, history);
    this._observer = reaction(
      () => {
        return { isOffline, isOpen };
      },
      ({ isOffline, isOpen }) => {
        this.showAlert(isOffline, isOpen);
      },
    );
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
