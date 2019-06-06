/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-03 18:03:24
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ViewProps } from './types';
import { JuiFabButton } from 'jui/components/Buttons';

type Props = ViewProps & WithTranslation;

@observer
class ForwardBtnViewComponent extends Component<Props> {
  private _handleClick = () => {
    const { forward } = this.props;
    forward();
  }

  render() {
    const { t } = this.props;
    return (
      <JuiFabButton
        color="semantic.positive"
        onClick={this._handleClick}
        size="moreLarge"
        showShadow={false}
        tooltipPlacement="top"
        iconName="forwardcall"
        data-test-automation-id="telephony-forward-btn"
        aria-label={t('telephony.action.forward')}
        tooltipTitle={t('telephony.action.forward')}
      />
    );
  }
}

const ForwardBtnView = withTranslation('translations')(ForwardBtnViewComponent);

export { ForwardBtnView };
