/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-22 03:46:38
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
class TransferViewComponent extends Component<Props> {
  private _handleTransferCall = () => {
    const { transferCall } = this.props;
    transferCall();
  };

  render() {
    const { t, transferNumber } = this.props;
    return (
      <JuiTransferAction>
        <JuiIconButton
          shouldPersistBg
          size="large"
          color="grey.900"
          aria-label={t('telephony.action.transfer')}
          onClick={this._handleTransferCall}
          data-test-automation-id="telephony-transfer-btn"
          disabled={!transferNumber}
        >
          transfer-call
        </JuiIconButton>
        <span>{t('telephony.action.transfer')}</span>
      </JuiTransferAction>
    );
  }
}

const TransferView = withTranslation('translations')(TransferViewComponent);

export { TransferView };
