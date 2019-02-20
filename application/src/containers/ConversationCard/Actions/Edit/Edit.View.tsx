/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { EditViewProps } from './types';
import { JuiMenuItem } from 'jui/components';

type Props = EditViewProps & WithNamespaces;

@observer
class EditViewComponent extends Component<Props> {
  private _handleClick = () => {
    const { edit } = this.props;
    edit();
  }

  render() {
    const { t, disabled } = this.props;
    const menuItemOnClickProp = disabled
      ? {}
      : {
        onClick: this._handleClick,
      };
    return (
      <JuiMenuItem {...menuItemOnClickProp} icon="edit" disabled={disabled}>
        {t('message.action.editPost')}
      </JuiMenuItem>
    );
  }
}

const EditView = translate('translations')(EditViewComponent);

export { EditView };
