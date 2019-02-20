/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { AddedViewProps } from './types';
import { translate, WithNamespaces } from 'react-i18next';
import { renderPerson } from '@/common/renderPerson';

class AddedViewComponent extends Component<AddedViewProps & WithNamespaces> {
  render() {
    const {
      inviterId,
      inviterName,
      newUserId,
      newUserName,
      createdAt,
      t,
    } = this.props;
    const inviter = renderPerson(inviterId, inviterName);
    const newUser = renderPerson(newUserId, newUserName);
    const html = t('message.stream.addedToTeam', { inviter, newUser });
    return (
      <React.Fragment>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <div className="datetime">{createdAt}</div>
      </React.Fragment>
    );
  }
}

const AddedView = translate('translations')(AddedViewComponent);

export { AddedView };
