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
import { JuiButtonBar, JuiIconButton } from 'jui/components/Buttons';
import { Avatar } from '@/containers/Avatar';
import { ViewProps, SearchResult, SearchSection } from './types';

const Actions = () => {
  return (
    <JuiButtonBar size="small">
      <JuiIconButton variant="plain" tooltipTitle={t('contacts')}>
        contacts
      </JuiIconButton>
    </JuiButtonBar>
  );
};

type State = {
  terms: string[];
  focus: boolean;
  persons: SearchResult['persons'];
  groups: SearchResult['groups'];
  teams: SearchResult['teams'];
};

const defaultSection = {
  sortableModel: [],
  hasMore: false,
};

class SearchBarView extends React.Component<ViewProps, State> {
  private _debounceSearch: Function;

  state = {
    terms: [],
    focus: false,
    persons: defaultSection,
    groups: defaultSection,
    teams: defaultSection,
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
    },                              300);
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    const { value } = e.target;
    const { setValue } = this.props;
    setValue(value);
    if (!value.trim()) {
      this.setState({
        terms: [],
        persons: defaultSection,
        groups: defaultSection,
        teams: defaultSection,
      });
      return;
    }
    this._debounceSearch(value);
  }

  onFocus = () => {
    this.setState({
      focus: true,
    });
  }

  onClear = () => {
    const { setValue } = this.props;
    setValue('');
  }

  onClose = () => {
    this.setState({
      focus: false,
    });
  }

  private _Avatar(uid: number) {
    return <Avatar uid={uid} size="small" />;
  }

  private _renderSuggestion<T>(
    type: SearchSection<T>,
    title: string,
    terms: string[],
  ) {
    return (
      <>
        {type.sortableModel.length > 0 && <JuiSearchTitle title={title} />}
        {type.sortableModel.map((item: any) => {
          const { id, displayName } = item;
          return (
            <>
              <JuiSearchItem
                Avatar={this._Avatar(id)}
                value={displayName}
                terms={terms}
                Actions={Actions()}
              />
            </>
          );
        })}
      </>
    );
  }

  render() {
    const { terms, persons, groups, teams, focus } = this.state;
    const { searchValue } = this.props;

    return (
      <JuiSearchBar onClose={this.onClose} focus={focus}>
        <JuiSearchInput
          focus={focus}
          onFocus={this.onFocus}
          onClear={this.onClear}
          value={searchValue}
          onChange={this.onChange}
        />
        {focus && searchValue && (
          <JuiSearchList>
            {this._renderSuggestion(persons, 'People', terms)}
            {this._renderSuggestion(groups, 'Groups', terms)}
            {this._renderSuggestion(teams, 'Teams', terms)}
          </JuiSearchList>
        )}
      </JuiSearchBar>
    );
  }
}

export { SearchBarView };
