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

import { ViewProps, SearchItems } from './types';
import { RecentSearchModel } from 'sdk/module/search';

import { SearchSectionsConfig } from './config';

const SEARCH_DELAY = 50;

const InvalidIndexPath: number[] = [-1, -1];

type Props = { closeSearchBar: () => void; isShowSearchBar: boolean };

@observer
class SearchBarView extends React.Component<ViewProps & Props> {
  private _debounceSearch: Function;
  private timer: number;
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

  private _resetData() {
    const { resetData } = this.props;
    resetData();
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    const { value } = e.target;
    const { setValue, updateFocus, focus, getRecent } = this.props;
    setValue(value);
    if (!value.trim()) {
      this._resetData();
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
    const { setValue } = this.props;
    setValue('');
    this._resetData();
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
    // this.setState({
    //   selectIndex: InvalidIndexPath,
    // });
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

  onKeyUp = () => {
    // const { selectIndex } = this.state;
    const {
      selectIndex,
      setSelectIndex,
      findNextValidSectionLength,
    } = this.props;
    const [section, cell] = selectIndex;
    if (cell > 0) {
      setSelectIndex(section, cell - 1);
    } else {
      if (section > 0) {
        const [nextSection, sectionLength] = findNextValidSectionLength(
          section - 1,
          -1,
        );
        if (nextSection !== -1) {
          setSelectIndex(nextSection, sectionLength - 1);
        }
      }
    }
  }

  onKeyDown = () => {
    // const { selectIndex } = this.state;
    const {
      selectIndex,
      data,
      setSelectIndex,
      findNextValidSectionLength,
    } = this.props;
    const [section, cell] = selectIndex;
    // const { data } = this.state;
    const currentSection = section < 0 ? 0 : section;
    const searchItem: SearchItems = data[currentSection];

    if (!searchItem) {
      return;
    }
    const currentSectionLength = searchItem.ids.length;
    if (cell < currentSectionLength - 1) {
      setSelectIndex(currentSection, cell + 1);
    } else {
      if (currentSection < data.length - 1) {
        const [nextSection] = findNextValidSectionLength(section + 1, 1);
        if (nextSection !== -1) {
          setSelectIndex(nextSection, 0);
        }
      }
    }
  }

  // if search item removed need update selectIndex
  selectIndexChange = (sectionIndex: number, cellIndex: number) => {
    // const [section, cell] = this.state.selectIndex;
    const [section, cell] = this.props.selectIndex;
    const { setSelectIndex } = this.props;
    // let { data } = this.state;
    let { data } = this.props;
    data = data.slice(0);

    const items: SearchItems = data[sectionIndex];
    items.ids.splice(cellIndex, 1);
    // this.setState({ data });
    this.props.setData(data);
    // remove current select item
    if (sectionIndex === section && cell === cellIndex) {
      setSelectIndex(InvalidIndexPath[0], InvalidIndexPath[1]);
      return;
    }

    // remove before current select item
    if (sectionIndex === section && cellIndex < cell) {
      setSelectIndex(section, cell - 1);
    }
  }

  addHighlight = (sectionIndex: number, cellIndex: number) => () => {
    this.props.setSelectIndex(sectionIndex, cellIndex);
  }

  mouseLeaveItem = () => {
    this.props.setSelectIndex(InvalidIndexPath[0], InvalidIndexPath[1]);
  }

  onKeyEsc = () => {
    this.textInput.current!.blurTextInput();
    this.onClose();
  }

  searchBarBlur = () => {
    this.timer = setTimeout(() => {
      this.onClose();
    });
  }

  searchBarFocus = () => {
    clearTimeout(this.timer);
  }

  get searchResult() {
    // const { data, terms, selectIndex } = this.state;
    const { data, terms, selectIndex } = this.props;
    return data.map(
      ({ ids, name, hasMore }: SearchItems, sectionIndex: number) => {
        if (ids.length === 0) return null;

        const { SearchItem, title } = SearchSectionsConfig[name];

        return (
          <React.Fragment key={name}>
            <JuiSearchTitle
              isShowMore={hasMore}
              showMore={i18next.t('home.showMore')}
              title={i18next.t(title)}
              data-test-automation-id={`search-${title}`}
            />
            {ids.map((id: number, cellIndex: number) => (
              <SearchItem
                cellIndex={cellIndex}
                selectIndex={selectIndex}
                sectionIndex={sectionIndex}
                onMouseEnter={this.addHighlight}
                onMouseLeave={this.mouseLeaveItem}
                hasMore={hasMore}
                title={title}
                goToConversation={this._goToConversation}
                handleJoinTeam={this.handleJoinTeam}
                didChange={this.selectIndexChange}
                terms={terms}
                id={id}
                key={id}
              />
            ))}
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

  get searchRecord() {
    // const { terms, selectIndex } = this.state;
    const { terms, selectIndex } = this.props;
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
        {recentRecord.map(
          ({ value, type }: RecentSearchModel, cellIndex: number) => {
            const { SearchItem, title } = SearchSectionsConfig[type];
            return (
              <SearchItem
                cellIndex={cellIndex}
                selectIndex={selectIndex}
                sectionIndex={1}
                onMouseEnter={this.addHighlight}
                onMouseLeave={this.mouseLeaveItem}
                hasMore={false}
                title={title}
                goToConversation={this._goToConversation}
                handleJoinTeam={this.handleJoinTeam}
                didChange={this.selectIndexChange}
                terms={terms}
                id={value}
                key={value}
              />
            );
          },
        )}
      </>
    );
  }

  render() {
    const { searchValue, focus } = this.props;

    return (
      <JuiSearchBar
        onClose={this.onClose}
        focus={focus}
        tabIndex={0}
        onBlur={this.searchBarBlur}
        onFocus={this.searchBarFocus}
      >
        <HotKeys
          keyMap={{
            up: this.onKeyUp,
            down: this.onKeyDown,
            esc: this.onKeyEsc,
          }}
        >
          <JuiSearchInput
            ref={this.textInput}
            focus={focus}
            onClick={this.onFocus}
            onClear={this.onClear}
            value={searchValue}
            hasValue={!!searchValue || !!this.searchRecord}
            onChange={this.onChange}
            placeholder={i18next.t('home.search')}
            showCloseBtn={!!searchValue}
          />
          {focus && searchValue && (
            <JuiSearchList>{this.searchResult}</JuiSearchList>
          )}
          {focus && !searchValue && this.searchRecord && (
            <JuiSearchList>{this.searchRecord}</JuiSearchList>
          )}
        </HotKeys>
      </JuiSearchBar>
    );
  }
}

export { SearchBarView };
