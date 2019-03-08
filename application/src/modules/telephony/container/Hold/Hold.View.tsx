/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { HoldViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';

type Props = HoldViewProps & WithNamespaces;

@observer
class HoldViewComponent extends Component<Props> {
  private _handleHold = async () => {
    const { hold } = this.props;
    hold();
  }

  render() {
    const { t } = this.props;
    return (
      <JuiKeypadAction>
        <JuiIconButton
          color="grey.900"
          disableToolTip={true}
          onClick={this._handleHold}
          size="xxlarge"
          disabled={true}
        >
          hold
        </JuiIconButton>
        <span className="disabled">{t('telephony.action.hold')}</span>
      </JuiKeypadAction>
    );
  }
}

const HoldView = translate('translations')(HoldViewComponent);

export { HoldView };
