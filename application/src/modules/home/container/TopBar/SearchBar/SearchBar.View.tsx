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
import { goToConversation } from '@/common/goToConversation';
import visibilityChangeEvent from '@/store/base/visibilityChangeEvent';
import GroupModel from '@/store/models/Group';
import { joinTeam } from '@/common/joinPublicTeam';

import { ViewProps, ISearchItems, IRecentItems } from './types';
import { OpenProfileDialog } from '@/containers/common/OpenProfileDialog';
import { SearchSectionsConfig } from './config';
import { OpenProfile } from '@/common/OpenProfile';

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
    const { setValue, resetData } = this.props;
    setValue('');
    resetData();
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
    await goToConversation({ id });
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
    const Component = (
      <SearchItem
        cellIndex={cellIndex}
        selectIndex={selectIndex}
        sectionIndex={sectionIndex}
        onMouseEnter={this.hoverHighlight}
        onMouseLeave={resetSelectIndex} // this.mouseLeaveItem
        hasMore={hasMore}
        title={title}
        goToConversation={this._goToConversation}
        handleJoinTeam={this.handleJoinTeam}
        didChange={this.selectIndexChange}
        terms={terms}
        id={id}
        key={id}
      />
    );

    // id will be string if search content text
    return typeof id === 'number' ? (
      <OpenProfileDialog id={id} key={id} afterClick={this.onClose}>
        {Component}
      </OpenProfileDialog>
    ) : (
      Component
    );
  }

  get searchResultList() {
    const { searchResult } = this.props;
    return searchResult.map(
      ({ ids, type, hasMore }: ISearchItems, sectionIndex: number) => {
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
    if (recentRecord.length === 0) {
      return null;
    }

    return (
      <>
        <JuiSearchTitle
          onClick={this.clearRecent}
          isShowMore={true}
          showMore={'clear all'}
          title={'Recently search'}
          data-test-automation-id={'search-clear'}
        />
        {recentRecord.map(({ ids, types }: IRecentItems) => {
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

  onEnter = () => {
    const { getCurrentItemId } = this.props;
    const currentItemId = getCurrentItemId();
    if (!currentItemId) {
      return;
    }
    OpenProfile.show(currentItemId, null, this.onClose);
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
        <HotKeys
          keyMap={{
            up: onKeyUp,
            down: onKeyDown,
            esc: this.onKeyEsc,
            enter: this.onEnter,
          }}
        >
          {focus && searchValue && (
            <JuiSearchList>{this.searchResultList}</JuiSearchList>
          )}
          {focus && !searchValue && this.searchRecordList && (
            <JuiSearchList>{this.searchRecordList}</JuiSearchList>
          )}
        </HotKeys>
      </JuiSearchBar>
    );
  }
}

export { SearchBarView };
