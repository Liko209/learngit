/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:06:55
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ChangeViewProps } from './types';
import { withTranslation, WithTranslation } from 'react-i18next';
import { renderPerson } from '@/common/renderPerson';

@observer
class ChangeViewComponent extends Component<ChangeViewProps & WithTranslation> {
  render() {
    const {
      changerId,
      changerName,
      value,
      oldValue,
      createdAt,
      t,
    } = this.props;
    const changer = renderPerson(changerId, changerName);
    const html = t('message.stream.changeTeamName', {
      changer,
      value: `"${value}"`,
      oldValue: `"${oldValue}"`,
    });
    return (
      <React.Fragment>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <div className='datetime'>{createdAt}</div>
      </React.Fragment>
    );
  }
}

const ChangeView = withTranslation('translations')(ChangeViewComponent);

export { ChangeView };
