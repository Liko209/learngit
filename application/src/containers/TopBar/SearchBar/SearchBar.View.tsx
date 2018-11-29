/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:44
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
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
import { JuiButtonBar, JuiIconButton } from 'jui/components/Buttons';
import { Avatar } from '@/containers/Avatar';
import { goToConversation } from '@/common/goToConversation';

import {
  ViewProps,
  SearchResult,
  SearchSection,
  SortableModel,
  Person,
  Group,
} from './types';

const SEARCH_DELAY = 300;

type State = {
  terms: string[];
  focus: boolean;
  persons: SearchResult['persons'];
  groups: SearchResult['groups'];
  teams: SearchResult['teams'];
  selectIndex: number;
};

const defaultSection = {
  sortableModel: [],
  hasMore: false,
};

class SearchBarView extends React.Component<ViewProps, State> {
  private _debounceSearch: Function;
  private _searchItems: HTMLElement[];

  state = {
    terms: [],
    focus: false,
    persons: defaultSection,
    groups: defaultSection,
    teams: defaultSection,
    selectIndex: -1,
  };

  constructor(props: ViewProps) {
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
      });
    },                              SEARCH_DELAY);
  }

  private _resetData() {
    this.setState({
      terms: [],
      persons: defaultSection,
      groups: defaultSection,
      teams: defaultSection,
      selectIndex: -1,
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
    this.setState({
      focus: true,
    });
  }

  onBlur = () => {
    this.props.showSearchBar();
    this.onClose();
  }

  onClear = () => {
    const { setValue } = this.props;
    setValue('');
    this._resetData();
  }

  onClose = () => {
    this.setState({
      focus: false,
      selectIndex: -1,
    });
  }

  private _Avatar(uid: number) {
    return <Avatar uid={uid} size="small" />;
  }

  private _goToConversation = async (id: number) => {
    this.onClear();
    this.onClose();
    await goToConversation(id);
  }

  searchItemClickHandler = (id: number) => async () => {
    await this._goToConversation(id);
  }

  private _Actions = () => {
    return (
      <JuiButtonBar size="small">
        <JuiIconButton
          onClick={this.goToContacts()}
          variant="plain"
          tooltipTitle={t('contacts')}
        >
          contacts
        </JuiIconButton>
      </JuiButtonBar>
    );
  }

  goToContacts = () => (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  }

  private _renderSuggestion<T>(
    type: SearchSection<T>,
    title: string,
    terms: string[],
  ) {
    const { currentUserId } = this.props;

    return (
      <>
        {type.sortableModel.length > 0 && (
          <JuiSearchTitle showMore={type.hasMore} title={title} />
        )}
        {type.sortableModel.map((item: any) => {
          const { id, displayName, entity } = item;
          return (
            <JuiSearchItem
              key={id}
              onClick={this.searchItemClickHandler(id)}
              Avatar={this._Avatar(id)}
              value={displayName}
              terms={terms}
              Actions={this._Actions()}
              isPrivate={entity.is_team && entity.privacy === 'private'}
              isJoined={
                entity.is_team &&
                (!entity.is_public || entity.members.includes(currentUserId))
              }
            />
          );
        })}
      </>
    );
  }

  private _searchItemSetClass(index: number) {
    if (!this._searchItems.length) return;

    this._searchItems.forEach((item: HTMLElement) => {
      item.classList.remove('hover');
    });
    this._searchItems[index].classList.add('hover');
  }

  private _getSelectIndex(type: string): number {
    this._searchItems = Array.from(document.querySelectorAll('.search-items'));
    const { selectIndex } = this.state;
    let index: number;
    if (type === 'up') {
      index = selectIndex < 1 ? 0 : selectIndex - 1;
    } else {
      const { length } = this._searchItems;
      const max = length - 1;
      index = selectIndex < max ? selectIndex + 1 : max;
    }
    return index;
  }

  private _setSelectIndex(index: number) {
    this.setState(
      {
        selectIndex: index,
      },
      () => {
        this._searchItemSetClass(index);
      },
    );
  }

  onKeyUp = () => {
    const index = this._getSelectIndex('up');
    this._setSelectIndex(index);
  }

  onKeyDown = () => {
    const index = this._getSelectIndex('down');
    this._setSelectIndex(index);
  }

  onEnter = async () => {
    const { persons, groups, teams, selectIndex } = this.state;

    const searchItems = [
      ...persons.sortableModel,
      ...groups.sortableModel,
      ...teams.sortableModel,
    ];
    const selectItem = searchItems[selectIndex] as SortableModel<
      Person | Group
    >;
    if (selectItem) {
      await this._goToConversation(selectItem.id);
    }
  }

  render() {
    const { terms, persons, groups, teams, focus } = this.state;
    const { searchValue } = this.props;
    return (
      <JuiSearchBar onClose={this.onClose} focus={focus}>
        <HotKeys
          keyMap={{
            enter: this.onEnter,
            up: this.onKeyUp,
            down: this.onKeyDown,
          }}
        >
          {() => {
            return (
              <>
                <JuiSearchInput
                  focus={focus}
                  onFocus={this.onFocus}
                  onClear={this.onClear}
                  onBlur={this.onBlur}
                  value={searchValue}
                  onChange={this.onChange}
                  placeholder={t('search')}
                  showCloseBtn={!!searchValue}
                />
                {focus && searchValue && (
                  <JuiSearchList>
                    {this._renderSuggestion(persons, 'People', terms)}
                    {this._renderSuggestion(groups, 'Groups', terms)}
                    {this._renderSuggestion(teams, 'Teams', terms)}
                  </JuiSearchList>
                )}
              </>
            );
          }}
        </HotKeys>
      </JuiSearchBar>
    );
  }
}

export { SearchBarView };
