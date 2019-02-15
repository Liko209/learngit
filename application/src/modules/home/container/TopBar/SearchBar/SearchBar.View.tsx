/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:44
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ReactNode } from 'react';
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

import { ViewProps, SectionTypeMap } from './types';

import { SearchSectionsConfig } from './config';

const SEARCH_DELAY = 50;

type SearchItems = {
  ids: number[];
  name: SectionTypeMap;
  hasMore: boolean;
};

type State = {
  terms: string[];
  data: SearchItems[];
  selectIndex: number[];
};

const InvalidIndexPath: number[] = [-1, -1];

type Props = { closeSearchBar: () => void; isShowSearchBar: boolean };

@observer
class SearchBarView extends React.Component<ViewProps & Props, State> {
  private _debounceSearch: Function;
  private timer: number;
  textInput: React.RefObject<JuiSearchInput> = React.createRef();

  state = {
    terms: [],
    data: [],
    selectIndex: InvalidIndexPath,
  };

  constructor(props: ViewProps & Props) {
    super(props);
    const { search } = this.props;
    this._debounceSearch = debounce(async (value: string) => {
      const ret = await search(value);
      if (!ret) return;

      const { terms, people, groups, teams } = ret;
      const data: SearchItems[] = [
        {
          ...people,
          name: SectionTypeMap.PEOPLE,
        },
        {
          ...groups,
          name: SectionTypeMap.GROUPS,
        },
        {
          ...teams,
          name: SectionTypeMap.TEAMS,
        },
      ];
      this.setState({
        terms,
        data,
        selectIndex: InvalidIndexPath,
      });
    },                              SEARCH_DELAY);
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
    this.setState({
      terms: [],
      data: [],
      selectIndex: InvalidIndexPath,
    });
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    const { value } = e.target;
    const { setValue, updateFocus, focus } = this.props;
    setValue(value);
    if (!value.trim()) {
      this._resetData();
      return;
    }
    this._debounceSearch(value);
    if (!focus) {
      updateFocus(true);
    }
  }

  onFocus = () => {
    const { updateFocus, searchValue } = this.props;
    updateFocus(true);
    this._debounceSearch(searchValue);
  }

  onClear = () => {
    const { setValue } = this.props;
    setValue('');
    this._resetData();
  }

  onClose = () => {
    const { closeSearchBar, isShowSearchBar, updateFocus } = this.props;
    if (isShowSearchBar) {
      closeSearchBar();
    }
    updateFocus(false);
    this.setState({
      selectIndex: InvalidIndexPath,
    });
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

  private _setSelectIndex(section: number, cellIndex: number) {
    this.setState({
      selectIndex: [section, cellIndex],
    });
  }

  private _findNextValidSectionLength(
    section: number,
    offset: number,
  ): number[] {
    const { data } = this.state;
    for (let i = section; i >= 0 && i < data.length; i += offset) {
      const { length } = (data[i] as SearchItems).ids;
      if (length > 0) {
        return [i, length];
      }
    }
    return InvalidIndexPath;
  }

  onKeyUp = () => {
    const { selectIndex } = this.state;
    const [section, cell] = selectIndex;
    if (cell > 0) {
      this._setSelectIndex(section, cell - 1);
    } else {
      if (section > 0) {
        const [nextSection, sectionLength] = this._findNextValidSectionLength(
          section - 1,
          -1,
        );
        if (nextSection !== -1) {
          this._setSelectIndex(nextSection, sectionLength - 1);
        }
      }
    }
  }

  onKeyDown = () => {
    const { selectIndex } = this.state;
    const [section, cell] = selectIndex;
    const { data } = this.state;
    const currentSection = section < 0 ? 0 : section;
    const searchItem: SearchItems = data[currentSection];
    const currentSectionLength = searchItem.ids.length;
    if (cell < currentSectionLength - 1) {
      this._setSelectIndex(currentSection, cell + 1);
    } else {
      if (currentSection < data.length - 1) {
        const [nextSection] = this._findNextValidSectionLength(section + 1, 1);
        if (nextSection !== -1) {
          this._setSelectIndex(nextSection, 0);
        }
      }
    }
  }

  // if search item removed need update selectIndex
  selectIndexChange = (sectionIndex: number, cellIndex: number) => {
    const [section, cell] = this.state.selectIndex;

    let { data } = this.state;
    data = data.slice(0);

    const items: SearchItems = data[sectionIndex];
    items.ids.splice(cellIndex, 1);
    this.setState({ data });

    // remove current select item
    if (sectionIndex === section && cell === cellIndex) {
      this._setSelectIndex(InvalidIndexPath[0], InvalidIndexPath[1]);
      return;
    }

    // remove before current select item
    if (sectionIndex === section && cellIndex < cell) {
      this._setSelectIndex(section, cell - 1);
    }
  }

  addHighlight = (sectionIndex: number, cellIndex: number) => () => {
    this._setSelectIndex(sectionIndex, cellIndex);
  }

  mouseLeaveItem = () => {
    this._setSelectIndex(InvalidIndexPath[0], InvalidIndexPath[1]);
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

  render() {
    const { data, terms, selectIndex } = this.state;
    const { searchValue, focus } = this.props;
    const cells: ReactNode[] = data.map(
      ({ ids, name, hasMore }: SearchItems, sectionIndex: number) => {
        if (ids.length === 0) return null;

        const { SearchItem, title } = SearchSectionsConfig[name];

        return (
          <React.Fragment key={name}>
            <JuiSearchTitle
              isShowMore={hasMore}
              showMore={i18next.t('showMore')}
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
            onChange={this.onChange}
            placeholder={i18next.t('search')}
            showCloseBtn={!!searchValue}
          />
          {focus && searchValue && <JuiSearchList>{cells}</JuiSearchList>}
        </HotKeys>
      </JuiSearchBar>
    );
  }
}

export { SearchBarView };
