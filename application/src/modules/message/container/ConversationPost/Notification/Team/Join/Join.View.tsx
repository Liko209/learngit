/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable react/no-danger */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JoinViewProps } from './types';
import { withTranslation, WithTranslation } from 'react-i18next';
import { renderPerson } from '@/common/renderPerson';

@observer
class JoinViewComponent extends Component<JoinViewProps & WithTranslation> {
  render() {
    const { newUserId, newUserName, createdAt, t } = this.props;
    const newUser = renderPerson(newUserId, newUserName);
    const html = t('message.stream.joinTheTeam', { newUser });
    return (
      <React.Fragment>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <div className="datetime">{createdAt}</div>
      </React.Fragment>
    );
  }
}

const JoinView = withTranslation('translations')(JoinViewComponent);

export { JoinView };
