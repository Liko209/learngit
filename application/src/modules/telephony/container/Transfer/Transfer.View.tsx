/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-22 03:46:38
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ViewProps } from './types';
import { JuiFabButton } from 'jui/components/Buttons';
import { JuiTransferAction, JuiTransferActionText } from 'jui/pattern/Dialer';

type Props = ViewProps & WithTranslation;

@observer
class TransferViewComponent extends Component<Props> {
  render() {
    const {
      t,
      transferNumber,
      isWarmTransferPage,
      transferCall,
      completeTransfer,
      isTransferCallConnected,
    } = this.props;
    return isWarmTransferPage ? (
      <JuiFabButton
        color="semantic.positive"
        onClick={completeTransfer}
        size="moreLarge"
        showShadow={false}
        tooltipPlacement="top"
        tooltipTitle={t('telephony.action.completeTransfer')}
        aria-label={t('telephony.action.completeTransfer')}
        iconName="transfer-call"
        data-test-automation-id="complete-transfer-call-btn"
        disabled={!isTransferCallConnected}
      />
    ) : (
      <JuiTransferAction>
        <JuiFabButton
          size="mediumLarge"
          aria-label={t('telephony.action.transfer')}
          onClick={transferCall}
          data-test-automation-id="telephony-transfer-btn"
          disabled={!transferNumber}
          showShadow={false}
          iconName="transfer-call"
          color="grey.200"
          iconColor={['grey', '900']}
        />
        <JuiTransferActionText disabled={!transferNumber}>
          {t('telephony.action.transfer')}
        </JuiTransferActionText>
      </JuiTransferAction>
    );
  }
}

const TransferView = withTranslation('translations')(TransferViewComponent);

export { TransferView };
