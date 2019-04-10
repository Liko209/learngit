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
  ANY_TIME = 1,
  THIS_WEEK = 2,
  THIS_MONTH = 3,
  THIS_YEAR = 4,
}
enum DATE_PERIOD {
  WEEK = 28,
  MONTH = 300,
  YEAR = 365,
}

class SearchFilterViewModel extends StoreViewModel<SearchFilterProps> {
  @observable
  contentTypeItemsMap = [];

  @action
  handleSearchTypeChange = (type: ESearchContentTypes) => {
    this.props.setSearchOptions({ type });
  }
  @action
  handleSearchPostDateChange = (items: number) => {
    const TimeStamp =
      items === DATE_DICTIONARY.ANY_TIME ? null : this.getTimeStamp(items);
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
  get timeType() {
    if (!this.props.options.begin_time) {
      return DATE_DICTIONARY.ANY_TIME;
    }
    const currentTime = new Date().getTime();
    const days = Math.floor(
      (currentTime - this.props.options.begin_time) / (60 * 60 * 1000 * 24),
    );
    if (days < DATE_PERIOD.WEEK) return DATE_DICTIONARY.THIS_WEEK;
    if (days < DATE_PERIOD.MONTH) return DATE_DICTIONARY.THIS_MONTH;
    return DATE_DICTIONARY.THIS_YEAR;
  }
  @computed
  get typeFilter() {
    const typeMap = [
      { id: '', name: 'All', value: ESearchContentTypes.ALL },
      {
        id: TypeDictionary.TYPE_ID_POST,
        name: 'Messages',
        value: ESearchContentTypes.CHATS,
      },
      {
        id: TypeDictionary.TYPE_ID_EVENT,
        name: 'Events',
        value: ESearchContentTypes.EVENTS,
      },
      {
        id: TypeDictionary.TYPE_ID_FILE,
        name: 'Files',
        value: ESearchContentTypes.FILES,
      },
      {
        id: TypeDictionary.TYPE_ID_LINK,
        name: 'Links',
        value: ESearchContentTypes.LINKS,
      },
      {
        id: TypeDictionary.TYPE_ID_PAGE,
        name: 'Notes',
        value: ESearchContentTypes.NOTES,
      },
      {
        id: TypeDictionary.TYPE_ID_TASK,
        name: 'Tasks',
        value: ESearchContentTypes.TASKS,
      },
    ];
    const contentTypeItems: SearchContentTypeItem[] = typeMap.map(
      ({ id, value, name }) => {
        return {
          id,
          value,
          name,
          count: this.getContentsCount(id),
        };
      },
    );

    return contentTypeItems;
  }
  @computed
  get timePeriodFilter() {
    const timePostedItem = [
      { id: DATE_DICTIONARY.ANY_TIME, value: 'Anytime' },
      { id: DATE_DICTIONARY.THIS_WEEK, value: 'ThisWeek' },
      { id: DATE_DICTIONARY.THIS_MONTH, value: 'ThisMonth' },
      { id: DATE_DICTIONARY.THIS_YEAR, value: 'ThisYear' },
    ];
    return timePostedItem;
  }

  getContentsCount(id: number | string) {
    const { contentsCount } = this.props;
    if (id === '') {
      return null;
    }
    return contentsCount[id] ? contentsCount[id] : 0;
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
