/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 19:49:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ActivityViewProps } from './types';

type Props = WithNamespaces & ActivityViewProps;

@observer
class Activity extends Component<Props> {
  render() {
    const { activity, t } = this.props;
    const { action, quantifier, type = '' } = activity;
    return (
      <div>{action ? t(`${action}${type}`, { count: quantifier }) : ''}</div>
    );
  }
}

const ActivityView = translate('translations')(Activity);

export { ActivityView };
