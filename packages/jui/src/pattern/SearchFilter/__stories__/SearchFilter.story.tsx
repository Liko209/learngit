/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-08 20:14:01
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { JuiSearchFilter } from '..';
import { differenceBy } from 'lodash';
import { JuiDownshift } from '../../../components/Downshift';
import { JuiSearchItem } from '../../../pattern/ContactSearch';
import { JuiChip } from '../../../components/Chip';

const suggestions = [
  { id: 1, label: 'Afghanistan' },
  { id: 2, label: 'Aland Islands' },
  { id: 6, label: 'Algeria' },
  { id: 7, label: 'American Samoa' },
  { id: 8, label: 'Andorra' },
  { id: 9, label: 'Angola' },
  { id: 10, label: 'Anguilla' },
  { id: 11, label: 'Antarctica' },
  { id: 12, label: 'Antigua and Barbuda' },
  { id: 13, label: 'Argentina' },
  { id: 14, label: 'Armenia' },
  { id: 3, label: 'Bahamas' },
  { id: 4, label: 'Bahrain' },
];

type Item = {
  label: string;
  id: number;
};

const getItemById = (suggestions: Item[], id: number) =>
  suggestions.find((suggestion: Item) => suggestion.id === id);

const SearchItem = (props: any) => {
  const item = getItemById(suggestions, props.id);

  return item ? <JuiSearchItem {...props}>{item.label}</JuiSearchItem> : null;
};

const Chip = (props: any) => {
  const item = getItemById(suggestions, props.id);

  return item ? (
    <JuiChip {...props} label={item.label} />
  ) : (
    <JuiChip {...props} label={props.label} />
  );
};

const MultipleDownshift = () => {
  const [suggestionItems, setSuggestionItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const handleInputChange = (value: string) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;
    let filterSuggestions: any = [];

    if (inputLength === 0) {
      return setSuggestionItems([]);
    }
    filterSuggestions = differenceBy(suggestions, selectedItems, 'id');
    filterSuggestions = filterSuggestions.filter((suggestion: any) => {
      const keep =
        count < 5 &&
        suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;

      if (keep) {
        count += 1;
      }
      return keep;
    });
    setSuggestionItems(filterSuggestions);
  };
  const handleSelectChange = (selectedItems: Item[]) => {
    setSelectedItems(selectedItems);
  };
  return (
    <JuiDownshift
      selectedItems={[]}
      inputValue=""
      suggestionItems={suggestionItems}
      MenuItem={SearchItem}
      InputItem={Chip}
      inputLabel="Downshift"
      inputPlaceholder="placeholder"
      onInputChange={handleInputChange}
      onSelectChange={handleSelectChange}
      minRowHeight={50}
    />
  );
};

storiesOf('Pattern/SearchFilter', module).add('SearchFilter', () => {
  return (
    <JuiSearchFilter title="Filter">
      <MultipleDownshift />
      <MultipleDownshift />
    </JuiSearchFilter>
  );
});
