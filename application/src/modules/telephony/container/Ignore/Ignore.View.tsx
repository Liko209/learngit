/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { IgnoreViewProps } from './types';
import { JuiFabButton } from 'jui/components/Buttons';

type Props = IgnoreViewProps & WithTranslation;

@observer
class IgnoreViewComponent extends Component<Props> {
  private _handleIgnore = async () => {
    const { ignore } = this.props;
    ignore();
  }

  render() {
    const { t } = this.props;
    return (
      <JuiFabButton
        color="common.white"
        size="small"
        iconName="close"
        tooltipTitle={t('telephony.ignoreTheCall')}
        aria-label={t('telephony.ignoreTheCall')}
        onClick={this._handleIgnore}
        data-test-automation-id="telephony-ignore-btn"
      />
    );
  }
}

const IgnoreView = withTranslation('translations')(IgnoreViewComponent);

export { IgnoreView };
