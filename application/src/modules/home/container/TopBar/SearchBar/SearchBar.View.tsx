/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:44
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import i18next from 'i18next';
import { debounce } from 'lodash';
import {
  JuiSearchBar,
  JuiSearchList,
  JuiSearchInput,
  JuiSearchTitle,
} from 'jui/pattern/SearchBar';
import { HotKeys } from 'jui/hoc/HotKeys';
import { goToConversationWithLoading } from '@/common/goToConversation';
import visibilityChangeEvent from '@/store/base/visibilityChangeEvent';
import GroupModel from '@/store/models/Group';
import { joinTeam } from '@/common/joinPublicTeam';
import { RecentSearchTypes } from 'sdk/module/search/entity';

import { ViewProps, SearchItems, RecentItems } from './types';

import { SearchSectionsConfig } from './config';

const SEARCH_DELAY = 50;

type Props = { closeSearchBar: () => void; isShowSearchBar: boolean };

@observer
class SearchBarView extends React.Component<ViewProps & Props> {
  private _debounceSearch: Function;
  textInput: React.RefObject<JuiSearchInput> = React.createRef();

  constructor(props: ViewProps & Props) {
    super(props);
    const { setSearchResult } = this.props;
    this._debounceSearch = debounce(setSearchResult, SEARCH_DELAY);
  }

  componentDidMount() {
    visibilityChangeEvent(() => {
      const { focus } = this.props;
      if (focus) {
        this.textInput.current!.blurTextInput();
        this.onClose();
      }
    });
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    const { value } = e.target;
    const { setValue, updateFocus, focus, getRecent, resetData } = this.props;
    setValue(value);
    if (!value.trim()) {
      resetData();
      getRecent();
      return;
    }
    this._debounceSearch(value);
    if (!focus) {
      updateFocus(true);
    }
  }

  onFocus = () => {
    const { updateFocus, searchValue, getRecent } = this.props;
    updateFocus(true);
    if (searchValue) {
      this._debounceSearch(searchValue);
    } else {
      getRecent();
    }
  }

  onClear = () => {
    const { setValue, resetData, getRecent } = this.props;
    setValue('');
    resetData();
    getRecent();
  }

  onClose = () => {
    const {
      closeSearchBar,
      isShowSearchBar,
      updateFocus,
      resetSelectIndex,
    } = this.props;
    if (isShowSearchBar) {
      closeSearchBar();
    }
    updateFocus(false);
    resetSelectIndex();
  }

  private _goToConversation = async (id: number) => {
    this.onClear();
    this.onClose();
    await goToConversationWithLoading({ id });
  }

  handleJoinTeam = async (item: GroupModel) => {
    const joinTeamByItem = joinTeam(item);
    this.onClear();
    this.onClose();
    await joinTeamByItem();
  }

  // if search item removed need update selectIndex
  selectIndexChange = (sectionIndex: number, cellIndex: number) => {
    this.props.selectIndexChange(sectionIndex, cellIndex);
  }

  hoverHighlight = (sectionIndex: number, cellIndex: number) => () => {
    this.props.setSelectIndex(sectionIndex, cellIndex);
  }

  onKeyEsc = () => {
    this.textInput.current!.blurTextInput();
    this.onClose();
  }

  createSearchItem = (config: {
    id: number | string;
    cellIndex: number;
    sectionIndex: number;
    type: string;
    hasMore?: boolean;
  }) => {
    const { terms, selectIndex, resetSelectIndex } = this.props;
    const { id, type, hasMore, sectionIndex, cellIndex } = config;

    const { SearchItem, title } = SearchSectionsConfig[type];

    return (
      <SearchItem
        cellIndex={cellIndex}
        selectIndex={selectIndex}
        sectionIndex={sectionIndex}
        onMouseEnter={this.hoverHighlight}
        onMouseLeave={resetSelectIndex} // this.mouseLeaveItem
        hasMore={hasMore}
        title={title}
        goToConversation={this._goToConversation}
        onClose={this.onClose}
        onClear={this.onClear}
        handleJoinTeam={this.handleJoinTeam}
        didChange={this.selectIndexChange}
        terms={terms}
        id={id}
        key={id}
      />
    );
  }

  get searchResultList() {
    const { searchResult } = this.props;
    return searchResult.map(
      ({ ids, type, hasMore }: SearchItems, sectionIndex: number) => {
        if (ids.length === 0) return null;

        const { title } = SearchSectionsConfig[type];

        return (
          <React.Fragment key={type}>
            <JuiSearchTitle
              isShowMore={hasMore}
              showMore={i18next.t('home.showMore')}
              title={i18next.t(title)}
              data-test-automation-id={`search-${title}`}
            />
            {ids.map((id: number, cellIndex: number) => {
              return this.createSearchItem({
                id,
                type,
                hasMore,
                sectionIndex,
                cellIndex,
              });
            })}
          </React.Fragment>
        );
      },
    );
  }

  clearRecent = () => {
    const { clearRecent } = this.props;
    clearRecent();
    this.onClose();
    this.textInput.current!.focusTextInput();
  }

  get searchRecordList() {
    const { recentRecord } = this.props;

    if (recentRecord[0].ids.length === 0) {
      return null;
    }

    return (
      <>
        <JuiSearchTitle
          onClick={this.clearRecent}
          isShowMore={true}
          showMore={i18next.t('home.ClearHistory')}
          title={i18next.t('home.RecentSearches')}
          data-test-automation-id={'search-clear'}
        />
        {recentRecord.map(({ ids, types }: RecentItems) => {
          return ids.map((id: number | string, cellIndex: number) => {
            return this.createSearchItem({
              id,
              cellIndex,
              type: types[cellIndex],
              hasMore: false,
              sectionIndex: 0,
            });
          });
        })}
      </>
    );
  }

  onEnter = (e: KeyboardEvent) => {
    const {
      selectIndex,
      getCurrentItemId,
      addRecentRecord,
      getCurrentItemType,
      canJoinTeam,
    } = this.props;
    if (selectIndex[0] < 0) {
      return;
    }
    const currentItemId = getCurrentItemId();
    const currentItemType = getCurrentItemType();
    if (!currentItemId) {
      return;
    }

    addRecentRecord(currentItemId);
    if (currentItemType === RecentSearchTypes.PEOPLE) {
      this._goToConversation(currentItemId);
      return;
    }

    const { canJoin, group } = canJoinTeam(currentItemId);
    if (canJoin) {
      e.preventDefault();
      this.handleJoinTeam(group);
    } else {
      this._goToConversation(currentItemId);
    }
  }

  render() {
    const { searchValue, focus, onKeyUp, onKeyDown } = this.props;

    return (
      <JuiSearchBar onClose={this.onClose} focus={focus} tabIndex={0}>
        <JuiSearchInput
          ref={this.textInput}
          focus={focus}
          onClick={this.onFocus}
          onClear={this.onClear}
          value={searchValue}
          hasValue={!!searchValue || !!this.searchRecordList}
          onChange={this.onChange}
          placeholder={i18next.t('home.search')}
          showCloseBtn={!!searchValue}
        />
        {focus && (
          <HotKeys
            keyMap={{
              up: onKeyUp,
              down: onKeyDown,
              esc: this.onKeyEsc,
              enter: this.onEnter,
            }}
          >
            {searchValue && (
              <JuiSearchList data-test-automation-id="search-results">
                {this.searchResultList}
              </JuiSearchList>
            )}
            {!searchValue && this.searchRecordList && (
              <JuiSearchList data-test-automation-id="search-records">
                {this.searchRecordList}
              </JuiSearchList>
            )}
          </HotKeys>
        )}
      </JuiSearchBar>
    );
  }
}

export { SearchBarView };
