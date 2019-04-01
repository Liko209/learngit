/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { RecentSearchViewProps } from './types';

type Props = RecentSearchViewProps & WithTranslation;

@observer
class RecentSearchViewComponent extends Component<Props> {
  render() {
    return <div>recent search</div>;
  }
}

const RecentSearchView = withTranslation('translations')(
  RecentSearchViewComponent,
);

export { RecentSearchView };
