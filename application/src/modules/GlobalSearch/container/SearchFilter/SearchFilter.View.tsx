/*
 * @Author: ken.li
 * @Date: 2019-04-08 13:53:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiSearchFilter } from 'jui/pattern/SearchFilter';
import { ContactSearch } from '@/containers/ContactSearch';
import { ContactSearchType } from '@/containers/ContactSearch/types';
import { SearchFilterViewProps, SearchContentTypeItem } from './types';
import {
  JuiBoxSelect,
  JuiBoxSelectProps,
} from 'jui/components/Selects/BoxSelect';
import { JuiMenuItem } from 'jui/components';

type ViewProps = SearchFilterViewProps & WithTranslation;

@observer
class SearchFilterViewComponent extends Component<ViewProps> {
  boxSelectProps: Partial<JuiBoxSelectProps> = {
    heightSize: 'default',
    MenuProps: {
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'left',
      },
      getContentAnchorEl: null,
    },
  };

  render() {
    const {
      t,
      searchOptions,
      typeFilter,
      timePeriodFilter,
      handleSearchPersonChange,
      handleSearchGroupChange,
      handleSearchTypeChange,
      handleSearchPostDateChange,
      options,
    } = this.props;
    return (
      <JuiSearchFilter title={t('globalSearch.filters')}>
        <ContactSearch
          type={ContactSearchType.PERSON}
          onSelectChange={handleSearchPersonChange}
          label={t('globalSearch.postedBy')}
          placeholder={t('globalSearch.postedByPlaceholder')}
          isExcludeMe={true}
          groupId={
            searchOptions && searchOptions.group_id
              ? searchOptions.group_id
              : undefined
          }
          maxLength={60}
        />
        <ContactSearch
          type={ContactSearchType.GROUP}
          onSelectChange={handleSearchGroupChange}
          label={t('globalSearch.postedIn')}
          placeholder={t('globalSearch.postedInPlaceholder')}
          isExcludeMe={true}
          groupId={
            searchOptions && searchOptions.group_id
              ? searchOptions.group_id
              : undefined
          }
          maxLength={60}
        />
        <JuiBoxSelect
          {...this.boxSelectProps}
          handleChange={handleSearchTypeChange}
          label={t('globalSearch.Type')}
          isFullWidth={true}
          value={options.type as string}
        >
          {typeFilter.map((item: SearchContentTypeItem) => {
            return (
              <JuiMenuItem value={item.value} key={item.id}>
                {t(`globalSearch.${item.name}`)}
                {item.count ? ` (${item.count})` : ''}
              </JuiMenuItem>
            );
          })}
        </JuiBoxSelect>

        <JuiBoxSelect
          {...this.boxSelectProps}
          handleChange={handleSearchPostDateChange}
          label={t('globalSearch.TimePosted')}
          isFullWidth={true}
          value={this.props.timeType}
        >
          {timePeriodFilter.map((item: SearchContentTypeItem) => {
            return (
              <JuiMenuItem value={item.id} key={item.id}>
                {t(`globalSearch.${item.value}`)}
              </JuiMenuItem>
            );
          })}
        </JuiBoxSelect>
      </JuiSearchFilter>
    );
  }
}

const SearchFilterView = withTranslation('translations')(
  SearchFilterViewComponent,
);

export { SearchFilterView };
