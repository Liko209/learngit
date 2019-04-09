/*
 * @Author: ken.li
 * @Date: 2019-04-08 13:53:38
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { SelectedItem } from 'jui/components/Downshift/TextField';
import { SearchFilterProps, SearchContentTypeItem } from './types';
import { ESearchContentTypes } from 'sdk/api/glip/search';
import { TypeDictionary } from 'sdk/utils';

enum DATE_DICTIONARY {
  ANY_TIME = 99,
  THIS_WEEK = 2,
  THIS_MONTH = 3,
  THIS_YEAR = 4,
}

const TYPE_ID = {
  ['']: ESearchContentTypes.ALL,
  [TypeDictionary.TYPE_ID_EVENT]: ESearchContentTypes.CHATS,
  [TypeDictionary.TYPE_ID_FILE]: ESearchContentTypes.FILES,
  [TypeDictionary.TYPE_ID_LINK]: ESearchContentTypes.LINKS,
  [TypeDictionary.TYPE_ID_PAGE]: ESearchContentTypes.NOTES,
  [TypeDictionary.TYPE_ID_TASK]: ESearchContentTypes.TASKS,
};

class SearchFilterViewModel extends StoreViewModel<SearchFilterProps> {
  @observable
  contentTypeItemsMap = [];

  @action
  handleSearchTypeChange = (items: string) => {
    const TypeID = items === '99' ? null : TYPE_ID[items];
    this.props.setSearchOptions({ type: TypeID });
  }
  @action
  handleSearchPostDateChange = (items: string) => {
    const TimeStamp = items === '99' ? null : this.getTimeStamp(items);
    this.props.setSearchOptions({ begin_time: TimeStamp });
  }
  @action
  handleSearchPersonChange = (items: SelectedItem[]) => {
    if (items.length) {
      return this.props.setSearchOptions({ creator_id: items[0].id });
    }
    return this.props.setSearchOptions({ creator_id: null });
  }
  @action
  handleSearchGroupChange = (items: SelectedItem[]) => {
    if (items.length) {
      return this.props.setSearchOptions({ group_id: items[0].id });
    }
    return this.props.setSearchOptions({ group_id: null });
  }
  @computed
  get typeFilter() {
    const { contentsCount } = this.props;
    const typeMap = [
      { id: '99', value: 'All' },
      { id: TypeDictionary.TYPE_ID_POST, value: 'Messages' },
      { id: TypeDictionary.TYPE_ID_EVENT, value: 'Events' },
      { id: TypeDictionary.TYPE_ID_FILE, value: 'Files' },
      { id: TypeDictionary.TYPE_ID_LINK, value: 'Links' },
      { id: TypeDictionary.TYPE_ID_PAGE, value: 'Notes' },
      { id: TypeDictionary.TYPE_ID_TASK, value: 'Tasks' },
    ];
    console.log('contentsCount', contentsCount);
    const contentTypeItems: SearchContentTypeItem[] = typeMap.map(
      ({ id, value }) => {
        return {
          id,
          value,
          count: contentsCount[id],
        };
      },
    );

    return contentTypeItems;
  }
  @computed
  get timePeriodFilter() {
    const timePostedItem = [
      { id: 99, value: 'Anytime' },
      { id: 2, value: 'ThisWeek' },
      { id: 3, value: 'ThisMonth' },
      { id: 4, value: 'ThisYear' },
    ];
    return timePostedItem;
  }

  getTimeStamp(id: number | string | undefined) {
    const d: Date = new Date();
    switch (id) {
      case DATE_DICTIONARY.ANY_TIME:
        return null;
      case DATE_DICTIONARY.THIS_WEEK:
        return d.setDate(d.getDay() - 7);
      case DATE_DICTIONARY.THIS_MONTH:
        return d.setMonth(d.getMonth() - 1);
      case DATE_DICTIONARY.THIS_YEAR:
        return d.setFullYear(d.getFullYear() - 1);
    }
    return null;
  }
}

export { SearchFilterViewModel };
