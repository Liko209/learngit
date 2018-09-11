/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:36:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { parse } from 'qs';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';

import ViewModel from './ViewModel';
import ContentLoader from 'ui-components/organisms/ContentLoader';
import Alert from 'ui-components/molecules/Dialog/Alert';
import storeManager from '@/store';
import { computed, observable, action } from 'mobx';
import { observer } from 'mobx-react';

interface IProps extends RouteComponentProps<{}> {
  t: TranslationFunction;
}

@observer
class TokenGetter extends Component<IProps>  {
  private _vm: ViewModel;
  @observable open: boolean;

  constructor(props: IProps) {
    super(props);
    this._vm = new ViewModel();
  }

  async componentDidMount() {
    // RC User
    // http://localhost:3000/?state=STATE&code=CODE
    // Free User (Glip create a new user)
    // http://localhost:3000/?state=STATE&id_token=TOKEN
    try {
      const { location, history } = this.props;
      const params = parse(location.search, { ignoreQueryPrefix: true });
      const { state = '/', code, id_token: token } = params;
      if (code || token) {
        await this._vm.unifiedLogin({ code, token });
      }
      history.replace(state.replace('$', '&'));
    } catch (e) {
      this.setOpen(true);
    }
  }

  onClose = () => {
    const { location, history } = this.props;
    const params = parse(location.search, { ignoreQueryPrefix: true });
    const { state = '/' } = params;
    history.replace(state.replace('$', '&'));
  }

  @action.bound setOpen(open: boolean) {
    this.open = open;
  }

  @computed get offline() {
    const globalStore = storeManager.getGlobalStore();
    return globalStore.get('network') === 'offline';
  }

  render() {
    const { t } = this.props;
    return (
      <React.Fragment>
        <ContentLoader />
        {
          this.offline ?
            <Alert open={true} header={t('signInFailedTitle')} onClose={this.onClose}>
              {t('signInFailedContentNetwork')}
            </Alert> :
            <Alert open={this.open} header={t('signInFailedTitle')} onClose={this.onClose}>
              {t('signInFailedContent')}
            </Alert>
        }
      </React.Fragment>
    );
  }
}

export default translate('login')(withRouter(TokenGetter));
