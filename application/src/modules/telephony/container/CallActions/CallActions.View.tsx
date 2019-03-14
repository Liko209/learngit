/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { CallActionsViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';

type Props = CallActionsViewProps & WithNamespaces;

@observer
class CallActionsViewComponent extends Component<Props> {
  private _handleCallActions = async () => {
    const { callActions } = this.props;
    callActions();
  }

  render() {
    const { t } = this.props;
    return (
      <JuiKeypadAction>
        <JuiIconButton
          color="grey.900"
          disableToolTip={true}
          onClick={this._handleCallActions}
          size="xxlarge"
          disabled={true}
        >
          call_more
        </JuiIconButton>
        <span className="disabled">{t('telephony.action.callActions')}</span>
      </JuiKeypadAction>
    );
  }
}

const CallActionsView = translate('translations')(CallActionsViewComponent);

export { CallActionsView };
