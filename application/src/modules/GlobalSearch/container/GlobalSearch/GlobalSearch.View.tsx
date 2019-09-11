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
import { analyticsCollector } from '@/AnalyticsCollector';

import { GlobalSearchViewProps, SEARCH_VIEW } from './types';
import { FullSearch } from '../FullSearch';
import { InstantSearch } from '../InstantSearch';
import { RecentSearch } from '../RecentSearch';
import { InputContext } from '../context';
import { SHORT_CUT_KEYS } from '@/AnalyticsCollector/constants';
import { CLOSE_REASON } from '../../../../containers/Dialog/constants';

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

  trackGlobalSearchEsc = (e: React.MouseEvent, reason: string) => {
    this.props.onClose && this.props.onClose();
    if (reason === CLOSE_REASON.ESC) {
      analyticsCollector.shortcuts(SHORT_CUT_KEYS.ESCAPE);
    }
  };

  get currentView() {
    const { currentView, open } = this.props;

    if (!open) {
      return null;
    }
    analyticsCollector.showGlobalDialog();
    const componentMap = {
      [SEARCH_VIEW.FULL_SEARCH]: FullSearch,
      [SEARCH_VIEW.INSTANT_SEARCH]: InstantSearch,
      [SEARCH_VIEW.RECENT_SEARCH]: RecentSearch,
    };

    const CurrentView = componentMap[currentView];

    return (
      <InputContext.Provider value={this.state.ref}>
        <CurrentView />
      </InputContext.Provider>
    );
  }

  private _autoFocus = () => {
    const inputEl = this.state.ref.current;
    if (inputEl) {
      inputEl.focus();
    }
  }

  componentDidMount() {
    setTimeout(() => this._autoFocus(), 10);
  }

  componentDidUpdate({ open: preOpen }: GlobalSearchViewProps) {
    const inputEl = this.state.ref.current;
    const { open, needFocus } = this.props;
    if (!inputEl) {
      return;
    }
    if (!preOpen && open) {
      inputEl.focus();
    }
    if (needFocus) {
      inputEl.focus();
    }
  }

  render() {
    const { open, onClose, onBlur, searchKey, onClear, t, canGoTop } = this.props;

    return (
      <JuiGlobalSearch open={open} onClose={this.trackGlobalSearchEsc} canGoTop={canGoTop}>
        <JuiGlobalSearchInput
          ref={this.state.ref}
          value={searchKey}
          onClear={onClear}
          onClose={onClose}
          onChange={this.onChange}
          IconRightProps={{
            'data-test-automation-id': 'global-search-close',
          }}
          InputProps={{
            onBlur,
            autoFocus: true,
            inputProps: {
              'data-test-automation-id': 'global-search-input',
            },
          }}
          clearText={t('globalSearch.clear')}
        />
        {this.currentView}
      </JuiGlobalSearch>
    );
  }
}

const GlobalSearchView = withTranslation('translations')(
  GlobalSearchViewComponent,
);

export { GlobalSearchView };
