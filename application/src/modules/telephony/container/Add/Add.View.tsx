/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AddViewProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiKeypadAction } from 'jui/pattern/Dialer';

type Props = AddViewProps & WithTranslation;

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
          size="xxlarge"
          disabled={true}
        >
          call_add
        </JuiIconButton>
        <span className="disabled">{t('telephony.action.add')}</span>
      </JuiKeypadAction>
    );
  }
}

const AddView = withTranslation('translations')(AddViewComponent);

export { AddView };
