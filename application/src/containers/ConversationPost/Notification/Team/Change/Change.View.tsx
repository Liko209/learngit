/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { ChangeViewProps } from './types';
import { translate, WithNamespaces } from 'react-i18next';

class ChangeViewComponent extends Component<ChangeViewProps & WithNamespaces> {
  render() {
    const {
      changerId,
      changerName,
      value,
      oldValue,
      createdAt,
      t,
    } = this.props;
    const changer = `<a href="/users/${changerId}">${changerName}</a>`;
    return (
      <React.Fragment>
        {t('changeTeamName', { changer, value, oldValue })}
        <div>{createdAt}</div>
      </React.Fragment>
    );
  }
}

const ChangeView = translate('translations')(ChangeViewComponent);

export { ChangeView };
