/*
 * @Author: ken.li
 * @Date: 2019-04-08 13:53:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ContentSearchOptions } from '../ContentSearchResult/types';
import { SelectedItem } from 'jui/components/Downshift/TextField';

type SearchContentTypeItem = {
  id: number | string;
  value: string;
  [key: string]: any;
};

type SearchFilterProps = {
  setSearchOptions(searchOptions: ContentSearchOptions): void;
  contentsCount: object;
};

type SearchFilterViewProps = SearchFilterProps & {
  handleSearchPersonChange: (items: SelectedItem) => void;
  handleSearchGroupChange: (items: SelectedItem) => void;
  handleSearchTypeChange: (items: string) => void;
  handleSearchPostDateChange: (items: string) => void;
  typeFilter: SearchContentTypeItem[];
  timePeriodFilter: SearchContentTypeItem[];
};

export { SearchFilterProps, SearchFilterViewProps, SearchContentTypeItem };
