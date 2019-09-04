/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-01 10:42:57
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import Downshift from 'downshift';
import { ChipProps } from '@material-ui/core/Chip';
import styled from '../../foundation/styled-components';
import {
  JuiDownshiftTextField,
  SelectedItem,
  JuiDownshiftTextFieldKeyDownEvent,
} from './TextField';
import { JuiDownshiftSuggestionList } from './SuggestionList';

type JuiDownshiftState = {
  isComposition: boolean;
};

type JuiDownshiftKeyDownEvent = JuiDownshiftTextFieldKeyDownEvent;

type JuiDownshiftProps = {
  selectedItems: SelectedItem[];
  inputValue: string;
  automationId?: string;
  multiple?: boolean;
  suggestionItems: SelectedItem[];
  MenuItem: React.ComponentType<any>;
  inputLabel: string;
  inputPlaceholder: string;
  InputItem?: React.ComponentType<ChipProps & { id: number }>;
  onInputChange: (value: string) => void;
  onSelectChange: (selectedItems: SelectedItem[]) => void;
  minRowHeight: number;
  autoSwitchEmail?: boolean;
  nameError?: boolean;
  emailError?: string;
  helperText?: string;
  messageRef?: React.RefObject<HTMLInputElement>;
  maxLength?: number;
  onKeyDown?: (event: JuiDownshiftKeyDownEvent) => void;
  autoFocus?: boolean;
};

const StyledDownshiftMultipleWrapper = styled.div`
  position: relative;
`;

class JuiDownshift extends React.PureComponent<
  JuiDownshiftProps,
  JuiDownshiftState
> {
  state: JuiDownshiftState = {
    isComposition: false,
  };

  handleChange = (item: SelectedItem) => {
    const { multiple } = this.props;
    let { selectedItems } = this.props;
    if (this.state.isComposition) {
      return;
    }

    if (selectedItems.indexOf(item) === -1) {
      if (multiple) {
        selectedItems = [...selectedItems, item];
      } else {
        selectedItems = [item];
      }
    }
    this.props.onSelectChange(selectedItems);
  };

  handleComposition = (isComposition: boolean) => {
    this.setState({ isComposition });
  };

  handleItemToString = (item: SelectedItem) => (item ? item.label : '');

  render() {
    const {
      inputValue,
      selectedItems,
      automationId,
      suggestionItems,
      MenuItem,
      minRowHeight,
      messageRef,
      inputPlaceholder: placeholder,
      inputLabel: label,
      ...textFieldProps
    } = this.props;

    return (
      <Downshift
        inputValue={inputValue}
        onChange={this.handleChange}
        selectedItem={selectedItems}
        defaultHighlightedIndex={0}
        itemToString={this.handleItemToString}
        id="downshift-multiple"
        itemCount={suggestionItems.length}
      >
        {({
          isOpen,
          getInputProps,
          getItemProps,
          getRootProps,
          highlightedIndex,
          openMenu,
        }) => (
          <StyledDownshiftMultipleWrapper {...getRootProps()}>
            <JuiDownshiftTextField
              inputValue={inputValue}
              label={label}
              selectedItems={selectedItems}
              placeholder={placeholder}
              getInputProps={getInputProps}
              onComposition={this.handleComposition}
              openMenu={openMenu}
              {...textFieldProps}
            />
            {isOpen && suggestionItems.length > 0 ? (
              <JuiDownshiftSuggestionList
                automationId={automationId}
                suggestionItems={suggestionItems}
                MenuItem={MenuItem}
                minRowHeight={minRowHeight}
                getItemProps={getItemProps}
                highlightedIndex={highlightedIndex}
              />
            ) : null}
          </StyledDownshiftMultipleWrapper>
        )}
      </Downshift>
    );
  }
}

export { JuiDownshift, JuiDownshiftProps, JuiDownshiftKeyDownEvent };
