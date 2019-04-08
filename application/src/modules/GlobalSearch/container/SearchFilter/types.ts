/*
 * @Author: ken.li
 * @Date: 2019-04-08 13:53:44
 * Copyright © RingCentral. All rights reserved.
 */
import { ContentSearchOptions } from '../ContentSearchResult/types';
import { SelectedItem } from 'jui/components/Downshift/TextField';

type SearchFilterProps = {
  setSearchOptions(searchOptions: ContentSearchOptions): void;
  searchOptions: ContentSearchOptions;
};

type SearchFilterViewProps = SearchFilterProps & {
  handleSearchPersonChange: (items: SelectedItem) => void;
  handleSearchGroupChange: (items: SelectedItem) => void;
};
export { SearchFilterProps, SearchFilterViewProps };
