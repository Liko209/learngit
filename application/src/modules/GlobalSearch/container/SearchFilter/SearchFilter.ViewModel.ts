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
} from './types';
import { ESearchContentTypes } from 'sdk/api/glip/search';

import moment from 'moment';
import { TYPE_MAP } from './config';
import { analyticsCollector } from '@/AnalyticsCollector';

class SearchFilterViewModel extends StoreViewModel<SearchFilterProps> {
  @observable
  contentTypeItemsMap = [];

  @action
  handleSearchTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currentType = this.props.searchOptions.type;
    const { value } = e.target;
    if (value !== currentType) {
      analyticsCollector.filterContentSearchResultByType(value);
      this.props.setSearchOptions({ type: value as ESearchContentTypes });
    }
  };
  @action
  handleSearchPostDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const beginTime = this.props.searchOptions.begin_time || null;
    const time = Number(e.target.value);
    const TimeStamp =
      time === DATE_DICTIONARY.ANY_TIME ? null : this.getTimeStamp(time);
    if (TimeStamp !== beginTime) {
      const item = this.timePeriodFilter.find(({ id }) => id === time);
      if (item) {
        analyticsCollector.filterContentSearchResultByTime(item.value);
      }
      this.props.setSearchOptions({ begin_time: TimeStamp });
    }
  };
  @action
  handleSearchPersonChange = (items: SelectedItem[]) => {
    if (items.length) {
      return this.props.setSearchOptions({ creator_id: items[0].id });
    }
    return this.props.setSearchOptions({ creator_id: null });
  };
  @action
  handleSearchGroupChange = (items: SelectedItem[]) => {
    if (items.length) {
      return this.props.setSearchOptions({ group_id: items[0].id });
    }
    return this.props.setSearchOptions({ group_id: null });
  };
  @computed
  get timeType() {
    const beginTime = this.props.searchOptions.begin_time;
    if (!beginTime) {
      return DATE_DICTIONARY.ANY_TIME;
    }
    const firstDay = moment(beginTime).valueOf();
    if (
      moment()
        .startOf('week')
        .valueOf() === firstDay
    ) {
      return DATE_DICTIONARY.THIS_WEEK;
    }
    if (
      moment()
        .startOf('month')
        .valueOf() === firstDay
    ) {
      return DATE_DICTIONARY.THIS_MONTH;
    }
    return DATE_DICTIONARY.THIS_YEAR;
  }
  @computed
  get typeFilter() {
    const contentTypeItems: SearchContentTypeItem[] = TYPE_MAP.map(
      ({ id, value, name }) => ({
        id,
        value,
        name,
        count: this.getContentsCount(id),
      }),
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
          .startOf('week')
          .valueOf();
      case DATE_DICTIONARY.THIS_MONTH:
        return moment()
          .startOf('month')
          .valueOf();
      case DATE_DICTIONARY.THIS_YEAR:
        return moment()
          .startOf('year')
          .valueOf();
      default:
        return null;
    }
  }
}

export { SearchFilterViewModel };
