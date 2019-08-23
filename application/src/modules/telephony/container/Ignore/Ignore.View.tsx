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
import { StyledActionText } from 'jui/pattern/Dialer';

type Props = IgnoreViewProps & WithTranslation;

@observer
class IgnoreViewComponent extends Component<Props> {
  private _handleIgnore = () => {
    const { ignore } = this.props;
    ignore();
  };

  render() {
    const { t } = this.props;
    return (
      <>
        <JuiFabButton
          color="grey.200"
          size="medium"
          showShadow={false}
          iconName="minimize"
          aria-label={t('telephony.ignoreTheCall')}
          onClick={this._handleIgnore}
          data-test-automation-id="telephony-ignore-btn"
        />
        <StyledActionText>{t('telephony.action.ignore')}</StyledActionText>
      </>
    );
  }
}

const IgnoreView = withTranslation('translations')(IgnoreViewComponent);

export { IgnoreView };
