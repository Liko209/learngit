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
      timePeriodFilter,
      typeFilter,
      handleSearchPersonChange,
      handleSearchGroupChange,
      handleSearchTypeChange,
      handleSearchPostDateChange,
      options,
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
        <JuiBoxSelect
          {...this.boxSelectProps}
          handleChange={handleSearchTypeChange}
          label={t('globalSearch.Type')}
          isFullWidth={true}
          value={options.type as string}
          automationId="typeSelector"
        >
          {typeFilter.map((item: SearchContentTypeItem) => {
            return (
              <JuiMenuItem
                automationId={`typeSelector-${item.name}`}
                value={item.value}
                key={item.id}
              >
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
          automationId="timePostSelector"
          value={this.props.timeType}
        >
          {timePeriodFilter.map((item: SearchContentTypeItem) => {
            return (
              <JuiMenuItem
                automationId={`timePost-${item.name}`}
                value={item.id}
                key={item.id}
              >
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
