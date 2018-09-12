/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:36:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';

import ViewModel from './ViewModel';
import ContentLoader from 'ui-components/organisms/ContentLoader';
import Alert from 'ui-components/molecules/Dialog/Alert';
import { observer } from 'mobx-react';

interface IProps extends RouteComponentProps<{}> {
  t: TranslationFunction;
}

@observer
class TokenGetter extends Component<IProps>  {
  private _vm: ViewModel;

  constructor(props: IProps) {
    super(props);
    this._vm = new ViewModel();
  }

  componentDidMount() {
    // RC User
    // http://localhost:3000/?state=STATE&code=CODE
    // Free User (Glip create a new user)
    // http://localhost:3000/?state=STATE&id_token=TOKEN
    const { location, history } = this.props;
    this._vm.unifiedLogin(location, history);
  }

  onClose = () => {
    const { location, history } = this.props;
    this._vm.onClose(location, history);
  }

  render() {
    const { t } = this.props;
    const { offline, open } = this._vm;
    return (
      <React.Fragment>
        <ContentLoader />
        {
          offline ?
            <Alert open={true} header={t('signInFailedTitle')} onClose={this.onClose}>
              {t('signInFailedContentNetwork')}
            </Alert> :
            <Alert open={open} header={t('signInFailedTitle')} onClose={this.onClose}>
              {t('signInFailedContent')}
            </Alert>
        }
      </React.Fragment>
    );
  }
}

export default translate('login')(withRouter(TokenGetter));
