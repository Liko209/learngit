/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 17:15:38
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import {
  JuiGlobalSearch,
  JuiGlobalSearchInput,
} from 'jui/pattern/GlobalSearch';

import { GlobalSearchViewProps, SEARCH_VIEW } from './types';
import { FullSearch } from '../FullSearch';
import { InstantSearch } from '../InstantSearch';
import { RecentSearch } from '../RecentSearch';

type GlobalSearchProps = GlobalSearchViewProps & WithTranslation;
const SEARCH_DELAY = 50;

@observer
class GlobalSearchViewComponent extends Component<GlobalSearchProps> {
  private _debounceSearch: Function;

  constructor(props: GlobalSearchProps) {
    super(props);
    const { onChange } = this.props;
    this._debounceSearch = debounce(onChange, SEARCH_DELAY);
  }

  onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this._debounceSearch(value);
  }

  get currentView() {
    const { currentView } = this.props;
    const componentMap = {
      [SEARCH_VIEW.FULL_SEARCH]: FullSearch,
      [SEARCH_VIEW.INSTANT_SEARCH]: InstantSearch,
      [SEARCH_VIEW.RECENT_SEARCH]: RecentSearch,
    };
    return componentMap[currentView];
  }

  render() {
    const { open, onClose, searchKey, onClear, showClear } = this.props;
    const CurrentView = this.currentView;

    return (
      <JuiGlobalSearch open={open} onClose={onClose}>
        <JuiGlobalSearchInput
          value={searchKey}
          showClear={showClear}
          onClear={onClear}
          onClose={onClose}
          onChange={this.onChange}
          InputProps={{
            autoFocus: true,
          }}
        />
        <CurrentView />
      </JuiGlobalSearch>
    );
  }
}

const GlobalSearchView = withTranslation('translations')(
  GlobalSearchViewComponent,
);

export { GlobalSearchView };
