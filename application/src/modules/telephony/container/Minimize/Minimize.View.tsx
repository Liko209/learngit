/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { MinimizeViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';

type Props = MinimizeViewProps & WithNamespaces;

@observer
class MinimizeViewComponent extends Component<Props> {
  private _handleMinimize = async () => {
    const { minimize } = this.props;
    minimize();
  }

  render() {
    const { t } = this.props;
    return (
      <JuiIconButton
        size="small"
        tooltipTitle={t('telephony.action.minimize')}
        onClick={this._handleMinimize}
        variant="plain"
        color="common.white"
      >
        minimize
      </JuiIconButton>
    );
  }
}

const MinimizeView = translate('translations')(MinimizeViewComponent);

export { MinimizeView };
