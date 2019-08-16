/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { EditViewProps } from './types';
import { JuiMenuItem } from 'jui/components/Menus';

type Props = EditViewProps & WithTranslation;

@observer
class EditViewComponent extends Component<Props> {
  private _handleClick = () => {
    const { edit } = this.props;
    edit();
  };

  render() {
    const { t, disabled } = this.props;
    const menuItemOnClickProp = disabled
      ? {}
      : {
          onClick: this._handleClick,
        };
    return (
      <JuiMenuItem
        {...menuItemOnClickProp}
        icon="edit"
        disabled={disabled}
        data-test-automation-id="message-action-edit"
      >
        {t('message.action.editPost')}
      </JuiMenuItem>
    );
  }
}

const EditView = withTranslation('translations')(EditViewComponent);

export { EditView };
