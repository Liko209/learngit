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
} from 'jui/src/components/Selects/BoxSelect';
import { JuiMenuItem } from 'jui/src/components';

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
<<<<<<< HEAD
      handleSearchPersonChange,
      handleSearchGroupChange,
      searchOptions,
=======
      typeFilter,
      timePeriodFilter,
      handleSearchPersonChange,
      handleSearchGroupChange,
      handleSearchTypeChange,
      handleSearchPostDateChange,
>>>>>>> feat(FIJI-4224): [Search for messages_filter results by type] refactor boxselector, add selector to container.
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
        >
          {typeFilter.map((item: SearchContentTypeItem) => {
            return (
              <JuiMenuItem value={item.id} key={item.id}>
                {t(`globalSearch.${item.value}`)}{' '}
                {item.count === undefined ? '' : `(${item.count})`}
              </JuiMenuItem>
            );
          })}
        </JuiBoxSelect>

        <JuiBoxSelect
          {...this.boxSelectProps}
          handleChange={handleSearchPostDateChange}
          label={t('globalSearch.TimePosted')}
          isFullWidth={true}
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
