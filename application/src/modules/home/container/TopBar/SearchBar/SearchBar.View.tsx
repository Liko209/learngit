/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:44
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { t } from 'i18next';
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

// import { PersonItem } from './PersonItem';
// import { GroupItem } from './GroupItem';
// import { MiniCard } from '@/containers/MiniCard';
import {
  ViewProps,
  SectionTypeMap,
  // SearchSection,
  // SortableModel,
  // Person,
  // Group,
} from './types';

import { SearchSectionsConfig } from './config';

const SEARCH_DELAY = 100;

type SearchItems = {
  ids: number[];
  hasMore: boolean;
};

type State = {
  terms: string[];
  people: SearchItems;
  groups: SearchItems;
  teams: SearchItems;
  selectIndex: number[];
  [x: string]: any;
};

const defaultSection = {
  ids: [],
  hasMore: false,
};

type SectionType = {
  data: any;
  name: number;
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
    focus: false,
    people: defaultSection,
    groups: defaultSection,
    teams: defaultSection,
    selectIndex: InvalidIndexPath,
  };

  constructor(props: ViewProps & Props) {
    super(props);
    const { search } = this.props;
    this._debounceSearch = debounce(async (value: string) => {
      const ret = await search(value);
      if (!ret) return;

      const { terms, people, groups, teams } = ret;
      this.setState({
        terms,
        groups,
        people,
        teams,
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
      persons: defaultSection,
      groups: defaultSection,
      teams: defaultSection,
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

  private _goToConversation = (id: number) => async () => {
    this.onClear();
    this.onClose();
    await goToConversation({ id });
  }

  searchItemClick = (name: number) => {
    const HANDLE_MAP = {
      [SectionTypeMap.PEOPLE]: this._goToConversation,
      [SectionTypeMap.GROUPS]: this.handleJoinTeam,
      [SectionTypeMap.TEAMS]: this.handleJoinTeam,
    };
    return HANDLE_MAP[name];
  }

  handleJoinTeam = (item: GroupModel) => async () => {
    const joinTeamByItem = joinTeam(item);
    this.onClear();
    this.onClose();
    await joinTeamByItem();
  }

  setSearchSection = (name: string) => (sections: any) => {
    this.setState({
      [name]: sections,
    });
  }

  private _setSelectIndex(section: number, cellIndex: number) {
    this.setState({
      selectIndex: [section, cellIndex],
    });
  }

  private _getDataSections = () => {
    const { people, groups, teams } = this.state;
    return [people, groups, teams];
  }

  private _findNextValidSectionLength<T>(
    section: number,
    offset: number,
  ): number[] {
    const data = this._getDataSections();
    for (let i = section; i >= 0 && i < data.length; i += offset) {
      const { length } = (data[i] as any).sortableModel;
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
    const data = this._getDataSections();
    const currentSection = section < 0 ? 0 : section;
    const currentSectionLength = (data[currentSection] as any).sortableModel
      .length;
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

  onEnter = async () => {
    // const { people, groups, teams, selectIndex } = this.state;
    // const [section, cell] = selectIndex;
    // const searchItems = [
    //   persons.sortableModel,
    //   groups.sortableModel,
    //   teams.sortableModel,
    // ];
    // if (section < 0 || cell < 0) {
    //   return;
    // }
    // const selectItem = searchItems[section][cell] as SortableModel<
    //   Person | Group
    // >;
    // if (selectItem) {
    //   await this._goToConversation(selectItem.id);
    // }
  }

  selectIndexChange = (sectionIndex: number, cellIndex: number) => {};

  addHighlight = (sectionIndex: number, cellIndex: number) => () => {
    this._setSelectIndex(sectionIndex, cellIndex);
  }

  mouseLeaveItem = () => {
    this._setSelectIndex(-1, -1);
  }

  onKeyEsc = () => this.onClose();

  searchBarBlur = () => {
    this.timer = setTimeout(() => {
      this.onClose();
    });
  }

  searchBarFocus = () => {
    clearTimeout(this.timer);
  }

  render() {
    const { people, groups, teams, terms, selectIndex } = this.state;
    const { searchValue, focus } = this.props;
    const sections: SectionType[] = [
      {
        data: people,
        name: SectionTypeMap.PEOPLE,
      },
      {
        data: groups,
        name: SectionTypeMap.GROUPS,
      },
      {
        data: teams,
        name: SectionTypeMap.TEAMS,
      },
    ];

    const cells: ReactNode[] = sections.map(
      ({ data, name }: SectionType, sectionIndex: number) => {
        const { ids, hasMore } = data;
        if (ids.length === 0) return null;

        const { SearchItem, title } = SearchSectionsConfig[name];

        return (
          <React.Fragment key={name}>
            <JuiSearchTitle
              isShowMore={hasMore}
              showMore={t('showMore')}
              title={t(title)}
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
                onClick={this.searchItemClick(name)}
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
            enter: this.onEnter,
            up: this.onKeyUp,
            down: this.onKeyDown,
            esc: this.onKeyEsc,
          }}
        >
          <JuiSearchInput
            ref={this.textInput}
            focus={focus}
            onFocus={this.onFocus}
            onClear={this.onClear}
            value={searchValue}
            onChange={this.onChange}
            placeholder={t('search')}
            showCloseBtn={!!searchValue}
          />
          {focus && searchValue && <JuiSearchList>{cells}</JuiSearchList>}
        </HotKeys>
      </JuiSearchBar>
    );
  }
}

export { SearchBarView };
