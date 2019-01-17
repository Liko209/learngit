/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:44
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
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
import { Dialog } from '@/containers/Dialog';
import { Avatar, GroupAvatar } from '@/containers/Avatar';
import { goToConversation } from '@/common/goToConversation';
import visibilityChangeEvent from '@/store/base/visibilityChangeEvent';
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

type Props = { closeSearchBar: () => void; isShowSearchBar: boolean };

@observer
class SearchBarView extends React.Component<ViewProps & Props, State> {
  private _debounceSearch: Function;
  private _searchItems: HTMLElement[];
  private timer: number;
  textInput: React.RefObject<JuiSearchInput> = React.createRef();

  state = {
    terms: [],
    focus: false,
    persons: defaultSection,
    groups: defaultSection,
    teams: defaultSection,
    selectIndex: -1,
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
        selectIndex: -1,
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
    const { updateFocus } = this.props;
    updateFocus(true);
    // this.setState({
    // focus: true,
    // });
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
      selectIndex: -1,
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

  addPublicTeam = (item: SortableModel<Group>) => (
    e: React.MouseEvent<HTMLElement>,
  ) => {
    const { joinTeam } = this.props;
    e.stopPropagation();
    Dialog.confirm({
      title: t('joinTeamTitle'),
      content: t('joinTeamContent', { teamName: item.displayName }),
      okText: t('join'),
      cancelText: t('Cancel'),
      onOK: () =>
        goToConversation({
          id: item.id,
          async beforeJump(conversationId: number) {
            await joinTeam(conversationId);
          },
        }),
    });
  }

  private _Actions = (item: SortableModel<Group>) => {
    return (
      <JuiButton
        onClick={this.addPublicTeam(item)}
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
    terms: string[],
  ) {
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
          type.sortableModel.map((item: any) => {
            const { id, displayName, entity } = item;
            const { is_team, privacy, members } = entity;
            const hasAction =
              is_team &&
              privacy === 'protected' &&
              !members.includes(currentUserId);

            const Actions = hasAction ? this._Actions(item) : null;

            return (
              <JuiSearchItem
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
    const { terms, persons, groups, teams } = this.state;
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
          {focus && searchValue && (
            <JuiSearchList>
              {this._renderSuggestion(persons, 'People', terms)}
              {this._renderSuggestion(groups, 'Groups', terms)}
              {this._renderSuggestion(teams, 'Teams', terms)}
            </JuiSearchList>
          )}
        </HotKeys>
      </JuiSearchBar>
    );
  }
}

export { SearchBarView };
