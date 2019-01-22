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
  JuiSearchItem,
} from 'jui/pattern/SearchBar';
import { HotKeys } from 'jui/hoc/HotKeys';
import { JuiButton } from 'jui/components/Buttons';
import { Avatar, GroupAvatar } from '@/containers/Avatar';
import { goToConversation } from '@/common/goToConversation';
import visibilityChangeEvent from '@/store/base/visibilityChangeEvent';
import { joinTeam } from '@/common/joinPublicTeam';
// import { MiniCard } from '@/containers/MiniCard';
import {
  ViewProps,
  SearchResult,
  SearchSection,
  SortableModel,
  Person,
  Group,
} from './types';

const SEARCH_DELAY = 100;

type State = {
  terms: string[];
  persons: SearchResult['persons'];
  groups: SearchResult['groups'];
  teams: SearchResult['teams'];
  selectIndex: number[];
};

const defaultSection = {
  sortableModel: [],
  hasMore: false,
};

type SectionType = {
  data: any;
  name: string;
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
    persons: defaultSection,
    groups: defaultSection,
    teams: defaultSection,
    selectIndex: InvalidIndexPath,
  };

  constructor(props: ViewProps & Props) {
    super(props);
    const { search } = this.props;
    this._debounceSearch = debounce(async (value: string) => {
      const ret = await search(value);
      const { terms, persons, groups, teams } = ret;
      this.setState({
        terms,
        groups,
        persons,
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
    const { setValue } = this.props;
    setValue(value);
    if (!value.trim()) {
      this._resetData();
      return;
    }
    this._debounceSearch(value);
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

  // private _openMiniCard = (uid: number) => (
  //   e: React.MouseEvent<HTMLElement>,
  // ) => {
  //   e.stopPropagation();
  //   MiniCard.showProfile({ anchor: e.target as HTMLElement, id: uid });
  // }

  private _Avatar(uid: number) {
    const { isTeamOrGroup } = this.props;

    return isTeamOrGroup(uid) ? (
      <GroupAvatar cid={uid} size="small" />
    ) : (
      <Avatar uid={uid} size="small" />
    );
  }

  private _goToConversation = async (id: number) => {
    this.onClear();
    this.onClose();
    await goToConversation({ id });
  }

  searchItemClickHandler = (id: number) => async () => {
    await this._goToConversation(id);
  }

  private _Actions = (item: SortableModel<Group>) => {
    return (
      <JuiButton
        onClick={joinTeam(item)}
        data-test-automation-id="joinButton"
        variant="round"
        size="small"
      >
        {t('join')}
      </JuiButton>
    );
  }

  goToContacts = () => (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  }

  private _renderSuggestion<T>(
    type: SearchSection<T>,
    title: string,
    sectionIndex: number,
  ) {
    const { terms, selectIndex } = this.state;
    const { currentUserId } = this.props;
    return (
      <>
        {type.sortableModel.length > 0 && (
          <JuiSearchTitle
            isShowMore={type.hasMore}
            showMore={t('showMore')}
            title={title}
            data-test-automation-id={`search-${title}`}
          />
        )}
        {type.sortableModel.length > 0 &&
          type.sortableModel.map((item: any, cellIndex: number) => {
            const { id, displayName, entity } = item;
            const { is_team, privacy, members } = entity;
            const hasAction =
              is_team &&
              privacy === 'protected' &&
              !members.includes(currentUserId);

            const Actions = hasAction ? this._Actions(item) : null;
            const hovered =
              sectionIndex === selectIndex[0] && cellIndex === selectIndex[1];
            return (
              <JuiSearchItem
                onMouseEnter={this.mouseAddHighlight(sectionIndex, cellIndex)}
                onMouseLeave={this.mouseLeaveItem}
                hovered={hovered}
                key={id}
                onClick={this.searchItemClickHandler(id)}
                Avatar={this._Avatar(id)}
                value={displayName}
                terms={terms}
                data-test-automation-id={`search-${title}-item`}
                Actions={Actions}
                isPrivate={entity.is_team && entity.privacy === 'private'}
                isJoined={
                  is_team &&
                  privacy === 'protected' &&
                  members.includes(currentUserId)
                }
              />
            );
          })}
      </>
    );
  }

  private _setSelectIndex(section: number, cellIndex: number) {
    this.setState({
      selectIndex: [section, cellIndex],
    });
  }

  private _getDataSections = () => {
    const { persons, groups, teams } = this.state;
    return [persons, groups, teams];
  }

  private _findNextValidSectionLength<T>(
    section: number,
    offset: number,
  ): number[] {
    const data = this._getDataSections();
    for (let i = section; i >= 0 && i < data.length; i += offset) {
      const { length } = (data[i] as SearchSection<T>).sortableModel;
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
    const { persons, groups, teams, selectIndex } = this.state;
    const [section, cell] = selectIndex;
    const searchItems = [
      persons.sortableModel,
      groups.sortableModel,
      teams.sortableModel,
    ];
    const selectItem = searchItems[section][cell] as SortableModel<
      Person | Group
    >;
    if (selectItem) {
      await this._goToConversation(selectItem.id);
    }
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

  mouseAddHighlight = (sectionIndex: number, cellIndex: number) => () => {
    this._setSelectIndex(sectionIndex, cellIndex);
  }

  mouseLeaveItem = () => {
    this._setSelectIndex(-1, -1);
  }

  render() {
    const { persons, groups, teams } = this.state;
    const { searchValue, focus } = this.props;
    const sections: SectionType[] = [
      {
        data: persons,
        name: 'People',
      },
      {
        data: groups,
        name: 'Groups',
      },
      {
        data: teams,
        name: 'Teams',
      },
    ];
    let cells: ReactNode[] = [];
    sections.forEach(
      ({ data, name }: SectionType, sectionIndex: number) =>
        (cells = cells.concat(this._renderSuggestion(data, name, sectionIndex))),
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
