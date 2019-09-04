/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-22 03:47:23
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
class AskFirstViewComponent extends Component<Props> {
  private _handleAskFirstCall = () => {
    const { directToAskFirst } = this.props;
    directToAskFirst();
  };

  render() {
    const { t, transferNumber } = this.props;
    return (
      <JuiTransferAction>
        <JuiFabButton
          size="mediumLarge"
          aria-label={t('telephony.action.askFirst')}
          onClick={this._handleAskFirstCall}
          data-test-automation-id="telephony-ask-first-btn"
          disabled={!transferNumber}
          showShadow={false}
          iconName="askfirst"
          color="grey.200"
          iconColor={['grey', '900']}
        />
        <JuiTransferActionText disabled={!transferNumber}>
          {t('telephony.action.askFirst')}
        </JuiTransferActionText>
      </JuiTransferAction>
    );
  }
}

const AskFirstView = withTranslation('translations')(AskFirstViewComponent);

export { AskFirstView };
