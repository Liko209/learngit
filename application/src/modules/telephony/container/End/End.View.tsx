/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { EndViewProps } from './types';
import { JuiFabButton } from 'jui/components/Buttons';
import { JuiIconography } from 'jui/foundation/Iconography';

type Props = EndViewProps & WithNamespaces;

@observer
class EndViewComponent extends Component<Props> {
  private _handleEnd = async () => {
    const { end } = this.props;
    end();
  }

  render() {
    return (
      <JuiFabButton
        color="semantic.negative"
        disableToolTip={true}
        onClick={this._handleEnd}
        size="large"
        showShadow={false}
        tooltipPlacement="top"
      >
        <JuiIconography>hand_up</JuiIconography>
      </JuiFabButton>
    );
  }
}

const EndView = translate('translations')(EndViewComponent);

export { EndView };
