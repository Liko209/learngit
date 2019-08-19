/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 17:15:38
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, ChangeEvent, RefObject } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  JuiGlobalSearch,
  JuiGlobalSearchInput,
  JuiOutlineTextFieldRef,
} from 'jui/pattern/GlobalSearch';

import { GlobalSearchViewProps, SEARCH_VIEW } from './types';
import { FullSearch } from '../FullSearch';
import { InstantSearch } from '../InstantSearch';
import { RecentSearch } from '../RecentSearch';
import { InputContext } from '../context';

type GlobalSearchProps = GlobalSearchViewProps & WithTranslation;

type State = {
  ref: RefObject<JuiOutlineTextFieldRef>;
};

@observer
class GlobalSearchViewComponent extends Component<GlobalSearchProps, State> {
  constructor(props: GlobalSearchProps) {
    super(props);
    this.state = {
      ref: React.createRef(),
    };
  }

  onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = this.props;
    onChange(e.target.value);
  };

  get currentView() {
    const { currentView } = this.props;
    const componentMap = {
      [SEARCH_VIEW.FULL_SEARCH]: FullSearch,
      [SEARCH_VIEW.INSTANT_SEARCH]: InstantSearch,
      [SEARCH_VIEW.RECENT_SEARCH]: RecentSearch,
    };
    return componentMap[currentView];
  }

  componentDidUpdate({ open: preOpen }: GlobalSearchViewProps) {
    const inputEl = this.state.ref.current;
    const open = this.props.open;

    if (!preOpen && open && inputEl) {
      inputEl.focus();
    }
  }

  render() {
    const { ref } = this.state;
    const { open, onClose, searchKey, onClear, showClear, t } = this.props;

    const CurrentView = this.currentView;

    return (
      <JuiGlobalSearch open={open} onClose={onClose}>
        <JuiGlobalSearchInput
          ref={ref}
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
          clearText={t('globalSearch.clear')}
        />
        <InputContext.Provider value={ref}>
          <CurrentView />
        </InputContext.Provider>
      </JuiGlobalSearch>
    );
  }
}

const GlobalSearchView = withTranslation('translations')(
  GlobalSearchViewComponent,
);

export { GlobalSearchView };
