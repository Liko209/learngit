/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-23 16:26:44
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { t } from 'i18next';
import {
  JuiSearchBar,
  JuiSearchList,
  JuiSearchInput,
  JuiSearchTitle,
  JuiSearchItem,
} from 'jui/pattern/SearchBar';
import { JuiButtonBar, JuiIconButton } from 'jui/components/Buttons';
import { Avatar } from '@/containers/Avatar';
import { ViewProps } from './types';
import { debounce } from 'lodash';

const Actions = () => {
  return (
    <JuiButtonBar size="small">
      <JuiIconButton variant="plain" tooltipTitle={t('contacts')}>
        contacts
      </JuiIconButton>
    </JuiButtonBar>
  );
};

class SearchBarView extends React.Component<ViewProps, {}> {
  private _debounceSearch: Function;

  constructor(props: ViewProps) {
    super(props);
    const { search } = this.props;
    this._debounceSearch = debounce(async (value: string) => {
      await search(value);
    },                              300);
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();
    this._debounceSearch(e.target.value);
  }

  private _Avatar() {
    return <Avatar uid={1234} size="small" />;
  }

  render() {
    return (
      <JuiSearchBar>
        <JuiSearchInput onChange={this.onChange} />
        <JuiSearchList>
          <JuiSearchTitle title="People" />
          <JuiSearchItem
            Avatar={this._Avatar()}
            value={'123'}
            terms={['1']}
            Actions={Actions()}
          />
          <JuiSearchTitle title="Groups" />
          <JuiSearchItem
            Avatar={this._Avatar()}
            value={'123'}
            terms={['1']}
            Actions={Actions()}
          />
          <JuiSearchItem
            Avatar={this._Avatar()}
            value={'123'}
            terms={['1']}
            Actions={Actions()}
          />
          <JuiSearchItem
            Avatar={this._Avatar()}
            value={'123'}
            terms={['1']}
            Actions={Actions()}
          />
          <JuiSearchTitle title="Teams" />
          <JuiSearchItem
            Avatar={this._Avatar()}
            value={'123'}
            terms={['1']}
            Actions={Actions()}
          />
        </JuiSearchList>
      </JuiSearchBar>
    );
  }
}

export { SearchBarView };
