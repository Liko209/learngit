/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-28 13:28:20
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { GetItemPropsOptions } from 'downshift';
import { withAutoSizer } from '../AutoSizer';
import { IndexRange, JuiVirtualizedList } from '../VirtualizedList';
import { SelectedItem } from './TextField';
import { StyledPaper, VL_STYLE } from './styles';

const VirtualizedListWithAutoSizer = withAutoSizer(JuiVirtualizedList);

type JuiDownshiftSuggestionListProps = {
  automationId?: string;
  suggestionItems: SelectedItem[];
  MenuItem: React.ComponentType<any>;
  minRowHeight: number;
  getItemProps: (options: GetItemPropsOptions<any>) => any;
  highlightedIndex: number | null;
};

type JuiDownshiftSuggestionListState = {
  renderedRange: IndexRange;
};

class JuiDownshiftSuggestionList extends React.PureComponent<
  JuiDownshiftSuggestionListProps,
  JuiDownshiftSuggestionListState
> {
  state = {
    renderedRange: { startIndex: 0, stopIndex: 0 },
  };

  private _handleRenderedRangeChange = (renderedRange: IndexRange) => {
    this.setState({ renderedRange });
  }

  render() {
    const { automationId, suggestionItems, minRowHeight } = this.props;

    return (
      <StyledPaper square={true} data-test-automation-id={automationId}>
        <VirtualizedListWithAutoSizer
          minRowHeight={minRowHeight}
          onRenderedRangeChange={this._handleRenderedRangeChange}
          style={VL_STYLE}
        >
          {suggestionItems.map((suggestionItem: SelectedItem, index: number) =>
            this._renderItem(suggestionItem, index),
          )}
        </VirtualizedListWithAutoSizer>
      </StyledPaper>
    );
  }

  private _renderItem(suggestionItem: SelectedItem, index: number) {
    const { MenuItem, highlightedIndex, getItemProps } = this.props;

    const isHighlighted = highlightedIndex === index;
    if (
      this.state.renderedRange.startIndex <= index &&
      index <= this.state.renderedRange.stopIndex
    ) {
      return (
        <MenuItem
          {...getItemProps({ item: suggestionItem })}
          itemId={suggestionItem.id}
          key={suggestionItem.id}
          isHighlighted={isHighlighted}
        />
      );
    }
    return { key: suggestionItem.id || 0 };
  }
}

export { JuiDownshiftSuggestionList, JuiDownshiftSuggestionListProps };
