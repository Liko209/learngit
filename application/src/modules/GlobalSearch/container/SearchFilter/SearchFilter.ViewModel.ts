/*
 * @Author: ken.li
 * @Date: 2019-04-08 13:53:38
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { SelectedItem } from 'jui/components/Downshift/TextField';
import {
  SearchFilterProps,
  SearchContentTypeItem,
  DATE_DICTIONARY,
  DATE_PERIOD,
} from './types';
import { ESearchContentTypes } from 'sdk/api/glip/search';
import { TypeDictionary } from 'sdk/utils';
import moment from 'moment';

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
    const days = moment(new Date()).diff(
      moment(this.props.options.begin_time),
      'days',
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
    switch (id) {
      case DATE_DICTIONARY.ANY_TIME:
        return null;
      case DATE_DICTIONARY.THIS_WEEK:
        return moment()
          .subtract(7, 'days')
          .valueOf();
      case DATE_DICTIONARY.THIS_MONTH:
        return moment()
          .subtract(1, 'months')
          .valueOf();
      case DATE_DICTIONARY.THIS_YEAR:
        return moment()
          .subtract(1, 'years')
          .valueOf();
    }
    return null;
  }
}

export { SearchFilterViewModel };
