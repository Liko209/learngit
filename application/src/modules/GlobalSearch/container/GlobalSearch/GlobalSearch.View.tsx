/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-08 14:50:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { GlobalSearchViewProps } from './types';
import {
  JuiGlobalSearch,
  JuiGlobalSearchInput,
} from 'jui/pattern/GlobalSearch';
import { FullSearch } from '../FullSearch';

type Props = GlobalSearchViewProps & WithTranslation;

@observer
class GlobalSearchViewComponent extends Component<Props> {
  render() {
    const { open, onClose } = this.props;
    return (
      <JuiGlobalSearch open={open} onClose={onClose}>
        <JuiGlobalSearchInput />
        <FullSearch />
      </JuiGlobalSearch>
    );
  }
}

const GlobalSearchView = withTranslation('translations')(
  GlobalSearchViewComponent,
);

export { GlobalSearchView };
