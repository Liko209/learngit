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
        size="moreLarge"
        showShadow={false}
        tooltipPlacement="top"
        iconName="hand_up"
      />
    );
  }
}

const EndView = withTranslation('translations')(EndViewComponent);

export { EndView };
