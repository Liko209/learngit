/*
 * @Author: ken.li
 * @Date: 2019-04-08 13:53:38
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { SearchFilterProps } from './types';
import { action } from 'mobx';
import { SelectedItem } from 'jui/components/Downshift/TextField';

class SearchFilterViewModel extends StoreViewModel<SearchFilterProps> {
  @action
  handleSearchPersonChange = (items: SelectedItem[]) => {
    if (items.length) {
      return this.props.setSearchOptions({ creator_id: items[0].id });
    }
    return this.props.setSearchOptions({ creator_id: null });
  }
  @action
  handleSearchGroupChange = (items: SelectedItem[]) => {
    console.log(items[0].id, 'shining');
    if (items.length) {
      return this.props.setSearchOptions({ group_id: items[0].id });
    }
    return this.props.setSearchOptions({ group_id: null });
  }
}

export { SearchFilterViewModel };
