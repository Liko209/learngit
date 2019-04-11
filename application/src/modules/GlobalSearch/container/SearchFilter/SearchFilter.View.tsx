/*
 * @Author: ken.li
 * @Date: 2019-04-08 13:53:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { SearchFilterViewProps } from './types';
import { JuiSearchFilter } from 'jui/pattern/SearchFilter';
import { ContactSearch, GroupSearch } from '@/containers/Downshift';

type ViewProps = SearchFilterViewProps & WithTranslation;

@observer
class SearchFilterViewComponent extends Component<ViewProps> {
  render() {
    const {
      t,
      handleSearchPersonChange,
      handleSearchGroupChange,
      searchOptions,
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
      </JuiSearchFilter>
    );
  }
}

const SearchFilterView = withTranslation('translations')(
  SearchFilterViewComponent,
);

export { SearchFilterView };
