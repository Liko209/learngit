/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { EndViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';

type Props = EndViewProps & WithNamespaces;

@observer
class EndViewComponent extends Component<Props> {
  private _handleEnd = async () => {
    const { end } = this.props;
    end();
  }

  render() {
    const { t } = this.props;
    return (
      <JuiIconButton
        color="semantic.negative"
        tooltipTitle={t('telephony.action.end')}
        onClick={this._handleEnd}
        size="xxlarge"
      >
        hand_up
      </JuiIconButton>
    );
  }
}

const EndView = translate('translations')(EndViewComponent);

export { EndView };
