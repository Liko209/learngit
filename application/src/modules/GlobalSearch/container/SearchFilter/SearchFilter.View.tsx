/*
 * @Author: ken.li
 * @Date: 2019-04-08 13:53:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { SearchFilterViewProps } from './types';
<<<<<<< HEAD
import { JuiSearchFilter } from 'jui/pattern/SearchFilter';
import { ContactSearch } from '@/containers/ContactSearch';
import { ContactSearchType } from '@/containers/ContactSearch/types';
=======
>>>>>>> feat(FIJI-4224): [Search for messages_filter results by type] searchFilter constructor

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
      </JuiSearchFilter>
    );
  }
}

const SearchFilterView = withTranslation('translations')(
  SearchFilterViewComponent,
);

export { SearchFilterView };
