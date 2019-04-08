/*
 * @Author: ken.li
 * @Date: 2019-04-08 13:53:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { SearchFilterViewProps } from './types';

type Props = SearchFilterViewProps & WithTranslation;

@observer
class SearchFilterViewComponent extends Component<Props> {
  render() {
    return <div>Right Container</div>;
  }
}

const SearchFilterView = withTranslation('translations')(
  SearchFilterViewComponent,
);

export { SearchFilterView };
