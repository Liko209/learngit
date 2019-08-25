/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-22 03:47:23
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiTransferAction } from 'jui/pattern/Dialer';

type Props = ViewProps & WithTranslation;

@observer
class AskFirstViewComponent extends Component<Props> {
  private _handleAskFirstCall = async () => {
    const { directToAskFirst } = this.props;
    directToAskFirst();
  };

  render() {
    const { t, transferNumber } = this.props;
    return (
      <JuiTransferAction>
        <JuiIconButton
          shouldPersistBg
          size="large"
          color="grey.900"
          aria-label={t('telephony.action.askFirst')}
          onClick={this._handleAskFirstCall}
          data-test-automation-id="telephony-ask-first-btn"
          disabled={!transferNumber}
        >
          askfirst
        </JuiIconButton>
        <span>{t('telephony.action.askFirst')}</span>
      </JuiTransferAction>
    );
  }
}

const AskFirstView = withTranslation('translations')(AskFirstViewComponent);

export { AskFirstView };
