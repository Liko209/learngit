/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-01 10:42:57
 * Copyright © RingCentral. All rights reserved.
 */
import _, { differenceBy } from 'lodash';
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import { JuiDownshift } from '..';
import { JuiSearchItem } from '../../../pattern/ContactSearch';
import { JuiChip } from '../../Chip';

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
  ..._.range(15, 100000).map((id: number) => ({ id, label: `Item-${id}` })),
];

const getKnobs = () => {
  const multiple = boolean('multiple', false);
  const autoSwitchEmail = boolean('autoSwitchEmail', false);
  return {
    multiple,
    autoSwitchEmail,
  };
};

type Item = {
  label: string;
  id: number;
};

const getItemById = (suggestions: Item[], id: number) =>
  suggestions.find((suggestion: Item) => suggestion.id === id);

const SearchItem = (props: any) => {
  const { itemId, isHighlighted, ...rest } = props;
  const item = getItemById(suggestions, itemId);

  return item ? (
    <JuiSearchItem selected={isHighlighted} {...rest}>
      {item.label}
    </JuiSearchItem>
  ) : null;
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
  const [inputValue, setInputValue] = useState('');
  const [suggestionItems, setSuggestionItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const handleInputChange = (value: string) => {
    const inputValue = value.trim().toLowerCase();
    setInputValue(inputValue);

    const inputLength = inputValue.length;
    let filterSuggestions: any = [];

    if (inputLength === 0) {
      return setSuggestionItems([]);
    }
    filterSuggestions = differenceBy(suggestions, selectedItems, 'id');
    filterSuggestions = filterSuggestions.filter((suggestion: any) => {
      const keep =
        suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;

      return keep;
    });
    setSuggestionItems(filterSuggestions);
  };
  const handleSelectChange = (selectedItems: Item[]) => {
    setSelectedItems(selectedItems);
    setInputValue('');
  };
  return (
    <JuiDownshift
      {...getKnobs()}
      suggestionItems={suggestionItems}
      MenuItem={SearchItem}
      InputItem={Chip}
      inputLabel='Downshift'
      inputPlaceholder='placeholder'
      onInputChange={handleInputChange}
      onSelectChange={handleSelectChange}
      minRowHeight={50}
      inputValue={inputValue}
      selectedItems={selectedItems}
    />
  );
};

storiesOf('Components/Downshift', module).add('Downshift', () => {
  return <MultipleDownshift />;
});
