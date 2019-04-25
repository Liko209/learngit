/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { CallActionsViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';

type Props = CallActionsViewProps & WithTranslation;

@observer
class CallActionsViewComponent extends Component<Props> {
  static defaultProps = { showLabel: true };

  private _handleCallActions = async () => {
    const { callActions } = this.props;
    callActions();
  }

  render() {
    const { t, showLabel, shouldPersistBg } = this.props;
    return (
      <JuiKeypadAction>
        <JuiIconButton
          color="grey.900"
          shouldPersistBg={shouldPersistBg}
          disableToolTip={true}
          onClick={this._handleCallActions}
          size={shouldPersistBg ? 'xlarge' : 'xxlarge'}
          disabled={true}
          data-test-automation-id="telephony-call-actions-btn"
        >
          call_more
        </JuiIconButton>
        {showLabel && (
          <span className="disabled">{t('telephony.action.callActions')}</span>
        )}
      </JuiKeypadAction>
    );
  }
}

const CallActionsView = withTranslation('translations')(
  CallActionsViewComponent,
);

export { CallActionsView };
