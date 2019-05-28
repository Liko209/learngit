/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-29 16:16:10
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { DialBtnViewProps } from './types';
import { JuiFabButton } from 'jui/components/Buttons';

type Props = DialBtnViewProps & WithTranslation;

const ANALYTICS_SOURCE = 'dialer';

@observer
class DialBtnViewComponent extends Component<Props> {
  private _handleMakeCall = async () => {
    const { makeCall, trackCall } = this.props;
    makeCall();
    trackCall(ANALYTICS_SOURCE);
  }

  render() {
    return (
      <JuiFabButton
        color="semantic.positive"
        disableToolTip={true}
        onClick={this._handleMakeCall}
        size="moreLarge"
        showShadow={false}
        tooltipPlacement="top"
        iconName="answer"
        data-test-automation-id="telephony-end-btn"
      />
    );
  }
}

const DialBtnView = withTranslation('translations')(DialBtnViewComponent);

export { DialBtnView };
