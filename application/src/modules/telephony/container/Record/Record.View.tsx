/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { RecordViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';

type Props = RecordViewProps & WithNamespaces;

@observer
class RecordViewComponent extends Component<Props> {
  private _handleRecord = async () => {
    const { record } = this.props;
    record();
  }

  render() {
    const { t } = this.props;
    return (
      <JuiKeypadAction>
        <JuiIconButton
          color="grey.900"
          disableToolTip={true}
          onClick={this._handleRecord}
          size="xxlarge"
          disabled={true}
        >
          record
        </JuiIconButton>
        <span className="disabled">{t('telephony.action.record')}</span>
      </JuiKeypadAction>
    );
  }
}

const RecordView = translate('translations')(RecordViewComponent);

export { RecordView };
