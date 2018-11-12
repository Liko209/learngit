/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { JoinViewProps } from './types';
import { translate, WithNamespaces } from 'react-i18next';

class JoinViewComponent extends Component<JoinViewProps & WithNamespaces> {
  render() {
    const { newUserId, newUserName, createdAt, t } = this.props;
    const newUser = `<a class="user" href="/users/${newUserId}">${newUserName}</a>`;
    const html = t('joinTheTeam', { newUser });
    return (
      <React.Fragment>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <div className="datetime">{createdAt}</div>
      </React.Fragment>
    );
  }
}

const JoinView = translate('translations')(JoinViewComponent);

export { JoinView };
