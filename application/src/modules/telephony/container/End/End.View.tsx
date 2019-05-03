/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { EndViewProps } from './types';
import { JuiFabButton } from 'jui/components/Buttons';

type Props = EndViewProps & WithTranslation;

@observer
class EndViewComponent extends Component<Props> {
  private _handleEnd = (event: React.MouseEvent) => {
    event.stopPropagation();
    const { end } = this.props;
    end();
  }

  render() {
    const { size, t } = this.props;
    return (
      <JuiFabButton
        color="semantic.negative"
        onClick={this._handleEnd}
        size={size ? size : 'moreLarge'}
        showShadow={false}
        tooltipPlacement="top"
        iconName="hand_up"
        data-test-automation-id="telephony-end-btn"
        aria-label={t('telephony.action.end')}
        tooltipTitle={t('telephony.action.end')}
      />
    );
  }
}

const EndView = withTranslation('translations')(EndViewComponent);

export { EndView };
