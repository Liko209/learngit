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
    const changer = `<a class="user" href="/users/${changerId}">${changerName}</a>`;
    const html = t('changeTeamName', { changer, value, oldValue });
    return (
      <React.Fragment>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <div className="datetime">{createdAt}</div>
      </React.Fragment>
    );
  }
}

const ChangeView = translate('translations')(ChangeViewComponent);

export { ChangeView };
