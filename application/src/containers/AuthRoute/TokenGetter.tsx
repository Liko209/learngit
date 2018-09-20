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
import Alert from 'ui-components/molecules/Dialog/Modal';
import { observer } from 'mobx-react';
import { reaction, IReactionDisposer } from 'mobx';

interface IProps extends RouteComponentProps<{}> {
  t: TranslationFunction;
}

@observer
class TokenGetter extends Component<IProps> {
  private _vm: ViewModel;
  private _observer: IReactionDisposer;
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
    this._observer = reaction(
      () => {
        const { offline, open } = this._vm;
        return { offline, open };
      },
      ({ offline, open }) => {
        this.showAlert(offline, open);
      },
    );
  }
  componentWillUnmount() {
    this._observer();
  }

  onClose = () => {
    const { location, history } = this.props;
    this._vm.onClose(location, history);
  }

  showAlert(offline: any, open: any) {
    const { t } = this.props;
    if (open) {
      Alert.alert(
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
        <ContentLoader />
      </React.Fragment>
    );
  }
}

export default translate('login')(withRouter(TokenGetter));
