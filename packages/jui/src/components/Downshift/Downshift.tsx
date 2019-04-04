/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-01 10:42:57
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import Downshift from 'downshift';
import styled from '../../foundation/styled-components';
import { JuiPaper } from '../Paper';
import { JuiDownshiftTextField, SelectedItem } from './TextField';
import { spacing, height } from '../../foundation/utils/styles';
import { MenuItemProps } from '@material-ui/core/MenuItem';
import { ChipProps } from '@material-ui/core/Chip';
// import { JuiVirtualizedList } from '../../components/VirtualizedList';
// import { JuiSizeMeasurer } from '../../components/SizeMeasurer';

type JuiDownshiftStates = {
  selectedItems: SelectedItem[];
  inputValue: string;
};

type JuiDownshiftProps = {
  automationId?: string;
  suggestionItems: SelectedItem[];
  SuggestionItem: React.ComponentType<MenuItemProps & { id: number }>;
  inputLabel: string;
  inputPlaceholder: string;
  InputItem?: React.ComponentType<ChipProps & { id: number }>;
  onInputChange: (value: string) => void;
  onSelectChange: (selectedItems: SelectedItem[]) => void;
};

const StyledDownshiftMultipleWrapper = styled.div`
  position: relative;
`;

const StyledPaper = styled(JuiPaper)`
  && {
    padding: ${spacing(2)} 0;
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateY(100%);
    width: 100%;
    max-height: ${height(50)};
    overflow: auto;
    z-index: ${({ theme }) => `${theme.zIndex.drawer}`};
  }
`;

class JuiDownshift extends React.Component<
  JuiDownshiftProps,
  JuiDownshiftStates
> {
  state: JuiDownshiftStates = {
    inputValue: '',
    selectedItems: [],
  };
  handleChange = (item: SelectedItem) => {
    let { selectedItems } = this.state;

    if (selectedItems.indexOf(item) === -1) {
      selectedItems = [...selectedItems, item];
    }

    setTimeout(() => {
      this.setState(
        {
          selectedItems,
          inputValue: '',
        },
        () => {
          this.props.onSelectChange(selectedItems);
        },
      );
    },         0);
  }
  handleInputChange = (value: string) => {
    this.setState({ inputValue: value });
    this.props.onInputChange(value);
  }
  handleSelectChange = (items: SelectedItem[]) => {
    this.setState({ selectedItems: items });
    this.props.onSelectChange(items);
    this.props.onInputChange(this.state.inputValue);
  }
  render() {
    const {
      automationId,
      suggestionItems,
      SuggestionItem,
      inputLabel,
      inputPlaceholder,
      InputItem,
    } = this.props;
    const { inputValue, selectedItems } = this.state;

    return (
      <Downshift
        id="downshift-multiple"
        inputValue={inputValue}
        onChange={this.handleChange}
        selectedItem={selectedItems}
        defaultHighlightedIndex={0}
        itemToString={(item: SelectedItem) => (item ? item.label : '')}
      >
        {({ getInputProps, getItemProps, isOpen, highlightedIndex }) => (
          <div>
            <StyledDownshiftMultipleWrapper>
              <JuiDownshiftTextField
                inputValue={inputValue}
                selectedItems={selectedItems}
                label={inputLabel}
                placeholder={inputPlaceholder}
                getInputProps={getInputProps}
                onInputChange={this.handleInputChange}
                onSelectChange={this.handleSelectChange}
                InputItem={InputItem}
              />
              {isOpen && suggestionItems.length ? (
                <StyledPaper
                  square={true}
                  data-test-automation-id={automationId}
                >
                  {suggestionItems.map(
                    (suggestionItem: SelectedItem, index) => {
                      const isHighlighted = highlightedIndex === index;
                      return (
                        <SuggestionItem
                          {...getItemProps({ item: suggestionItem })}
                          id={suggestionItem.id}
                          key={suggestionItem.id}
                          selected={isHighlighted}
                        />
                      );
                    },
                  )}
                </StyledPaper>
              ) : null}
            </StyledDownshiftMultipleWrapper>
          </div>
        )}
      </Downshift>
    );
  }
}

export { JuiDownshift, JuiDownshiftProps };
