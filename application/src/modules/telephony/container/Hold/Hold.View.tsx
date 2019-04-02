/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { HoldViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';

type Props = HoldViewProps & WithTranslation;

@observer
class HoldViewComponent extends Component<Props> {
  private _handleHold: () => void;

  constructor(props: Props) {
    super(props);
    this._handleHold = () => {
      const { handleClick } = this.props;
      return handleClick();
    };
  }

  render() {
    const { t, disabled, held } = this.props;
    return (
      <JuiKeypadAction>
        <JuiIconButton
          color={held ? 'grey.500' : 'grey.900'}
          disableToolTip={true}
          onClick={this._handleHold}
          size="xxlarge"
          disabled={disabled}
        // awake={awake}
        >
          hold
        </JuiIconButton>
        <span className="disabled">{t('telephony.action.hold')}</span>
      </JuiKeypadAction>
    );
  }
}

const HoldView = withTranslation('translations')(HoldViewComponent);

export { HoldView };
