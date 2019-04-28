/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 17:15:38
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiGlobalSearch,
  JuiGlobalSearchInput,
} from 'jui/pattern/GlobalSearch';
import { HotKeys } from 'jui/hoc/HotKeys';

import { GlobalSearchViewProps, SEARCH_VIEW } from './types';
import { FullSearch } from '../FullSearch';
import { InstantSearch } from '../InstantSearch';
import { RecentSearch } from '../RecentSearch';

type GlobalSearchProps = GlobalSearchViewProps & WithTranslation;

@observer
class GlobalSearchViewComponent extends Component<GlobalSearchProps> {
  onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = this.props;
    onChange(e.target.value);
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
      <HotKeys
        keyMap={{
          esc: onClose,
        }}
      >
        <JuiGlobalSearch open={open} onClose={onClose}>
          <JuiGlobalSearchInput
            value={searchKey}
            showClear={showClear}
            onClear={onClear}
            onClose={onClose}
            onChange={this.onChange}
            IconRightProps={{
              'data-test-automation-id': 'global-search-close',
            }}
            InputProps={{
              autoFocus: true,
              inputProps: {
                'data-test-automation-id': 'global-search-input',
              },
            }}
          />
          <CurrentView />
        </JuiGlobalSearch>
      </HotKeys>
    );
  }
}

const GlobalSearchView = withTranslation('translations')(
  GlobalSearchViewComponent,
);

export { GlobalSearchView };
