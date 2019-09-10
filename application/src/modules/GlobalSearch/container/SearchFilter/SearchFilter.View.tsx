/*
 * @Author: ken.li
 * @Date: 2019-04-08 13:53:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiSearchFilter } from 'jui/pattern/SearchFilter';
import { ContactSearch, GroupSearch } from '@/containers/Downshift';
import { SearchFilterViewProps, SearchContentTypeItem } from './types';
import { JuiLineSelect, MenuProps } from 'jui/components/Selects/LineSelect';
import { JuiMenuItem } from 'jui/components/Menus';

type ViewProps = SearchFilterViewProps & WithTranslation;

@observer
class SearchFilterViewComponent extends Component<ViewProps> {
  lineSelectProps: Partial<MenuProps> = {
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
    getContentAnchorEl: null,
  };

  render() {
    const {
      t,
      searchOptions,
      timePeriodFilter,
      typeFilter,
      handleSearchPersonChange,
      handleSearchGroupChange,
      handleSearchTypeChange,
      handleSearchPostDateChange,
    } = this.props;
    return (
      <JuiSearchFilter title={t('globalSearch.filters')}>
        <ContactSearch
          onSelectChange={handleSearchPersonChange}
          label={t('globalSearch.postedBy')}
          placeholder={t('globalSearch.postedByPlaceholder')}
          groupId={
            searchOptions && searchOptions.group_id
              ? searchOptions.group_id
              : undefined
          }
          maxLength={60}
        />
        <GroupSearch
          onSelectChange={handleSearchGroupChange}
          label={t('globalSearch.postedIn')}
          placeholder={t('globalSearch.postedInPlaceholder')}
          groupId={
            searchOptions && searchOptions.group_id
              ? searchOptions.group_id
              : undefined
          }
          maxLength={60}
        />
        <JuiLineSelect
          menuProps={this.lineSelectProps}
          onChange={handleSearchTypeChange}
          label={t('globalSearch.Type')}
          value={searchOptions.type as string}
          automationId="typeSelector"
        >
          {typeFilter.map((item: SearchContentTypeItem) => (
            <JuiMenuItem
              automationId={`typeSelector-${item.name}`}
              value={item.value}
              key={item.id}
            >
              {t(`globalSearch.${item.name}`)}
              {item.count !== null ? ` (${item.count})` : ''}
            </JuiMenuItem>
          ))}
        </JuiLineSelect>

        <JuiLineSelect
          menuProps={this.lineSelectProps}
          onChange={handleSearchPostDateChange}
          label={t('globalSearch.TimePosted')}
          automationId="timePostSelector"
          value={this.props.timeType}
        >
          {timePeriodFilter.map((item: SearchContentTypeItem) => (
            <JuiMenuItem
              automationId={`timePost-${item.value}`}
              value={item.id}
              key={item.id}
            >
              {t(`globalSearch.${item.value}`)}
            </JuiMenuItem>
          ))}
        </JuiLineSelect>
      </JuiSearchFilter>
    );
  }
}

const SearchFilterView = withTranslation('translations')(
  SearchFilterViewComponent,
);

export { SearchFilterView };
