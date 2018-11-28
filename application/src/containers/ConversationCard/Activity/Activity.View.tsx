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
  _getI18nParameter = (parameter: any) => {
    const { t } = this.props;
    const i18nParameter: {
      [key: string]: any;
    } = {};
    if (parameter.translated) {
      Object.keys(parameter.translated).forEach((key: string) => {
        i18nParameter[key] = t(parameter.translated[key]);
      });
    }
    if (parameter.numerals) {
      i18nParameter.count = parameter.numerals;
    }
    return i18nParameter;
  }

  render() {
    const { activity, t } = this.props;
    if (Object.keys(activity).length) {
      const { key, parameter } = activity;
      const i18nParameter = this._getI18nParameter(parameter);
      return <div>{t(key, i18nParameter)}</div>;
    }
    return null;
  }
}

const ActivityView = translate('translations')(Activity);

export { ActivityView };
