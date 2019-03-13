/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { KeypadViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';

type Props = KeypadViewProps & WithNamespaces;

@observer
class KeypadViewComponent extends Component<Props> {
  private _handleKeypad = async () => {
    const { keypad } = this.props;
    keypad();
  }

  render() {
    const { t } = this.props;
    return (
      <JuiKeypadAction>
        <JuiIconButton
          color="grey.900"
          disableToolTip={true}
          onClick={this._handleKeypad}
          size="xxlarge"
          disabled={true}
        >
          keypad
        </JuiIconButton>
        <span className="disabled">{t('telephony.action.keypad')}</span>
      </JuiKeypadAction>
    );
  }
}

const KeypadView = translate('translations')(KeypadViewComponent);

export { KeypadView };
