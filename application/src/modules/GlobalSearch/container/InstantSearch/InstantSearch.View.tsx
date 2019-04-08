/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 17:15:58
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { InstantSearchViewProps } from './types';

type Props = InstantSearchViewProps & WithTranslation;

@observer
class InstantSearchViewComponent extends Component<Props> {
  render() {
    return <div>instant search</div>;
  }
}

const InstantSearchView = withTranslation('translations')(
  InstantSearchViewComponent,
);

export { InstantSearchView };
