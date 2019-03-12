/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { AddViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';

type Props = AddViewProps & WithNamespaces;

@observer
class AddViewComponent extends Component<Props> {
  private _handleAdd = async () => {
    const { add } = this.props;
    add();
  }

  render() {
    const { t } = this.props;
    return (
      <JuiKeypadAction>
        <JuiIconButton
          color="grey.900"
          disableToolTip={true}
          onClick={this._handleAdd}
          size="xlarge"
          disabled={true}
        >
          zoom_in
        </JuiIconButton>
        <span className="disabled">{t('telephony.action.add')}</span>
      </JuiKeypadAction>
    );
  }
}

const AddView = translate('translations')(AddViewComponent);

export { AddView };
