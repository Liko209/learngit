import React from 'react';
import { mountWithTheme } from 'shield/utils';
import { JuiVirtualizedList } from '../../VirtualizedList';
import { JuiDownshiftSuggestionList } from '../SuggestionList';

const baseProps = {
  suggestionItems: [],
  MenuItem: () => <div>Item</div>,
  getItemProps: () => {},
  highlightedIndex: 0,
  minRowHeight: 20,
};

describe('JuiDownshiftSuggestionList', () => {
  it(`should apply VL to JuiDownshiftSuggestionList of downshift`, () => {
    const wrapper = mountWithTheme(
      <JuiDownshiftSuggestionList {...baseProps} />,
    );
    expect(wrapper.find(JuiVirtualizedList)).toHaveLength(1);
  });
});
