/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-04-01 10:42:57
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import Downshift from 'downshift';
import styled from '../../foundation/styled-components';
import { JuiPaper } from '../Paper';
import {
  JuiDownshiftTextField,
  SelectedItem,
  JuiDownshiftTextFieldKeyDownEvent,
} from './TextField';
import { spacing, height } from '../../foundation/utils/styles';
import { ChipProps } from '@material-ui/core/Chip';
import { JuiVirtualizedList } from '../../components/VirtualizedList';
import { JuiAutoSizer, Size } from '../../components/AutoSizer';

type JuiDownshiftStates = {
  selectedItems: SelectedItem[];
  inputValue: string;
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

class JuiDownshift extends React.PureComponent<
  JuiDownshiftProps,
  JuiDownshiftStates
> {
  handleChange = (item: SelectedItem) => {
    const { multiple } = this.props;
    let { selectedItems } = this.props;

    if (selectedItems.indexOf(item) === -1) {
      if (multiple) {
        selectedItems = [...selectedItems, item];
      } else {
        selectedItems = [item];
      }
    }
    this.props.onSelectChange(selectedItems);
  }
  handleInputChange = (value: string) => {
    this.props.onInputChange(value);
  }
  handleSelectChange = (items: SelectedItem[]) => {
    this.props.onSelectChange(items);
  }
  handleItemToString = (item: SelectedItem) => (item ? item.label : '');
  render() {
    const {
      automationId,
      suggestionItems,
      MenuItem,
      inputLabel,
      inputPlaceholder,
      InputItem,
      minRowHeight,
      autoSwitchEmail,
      multiple,
      messageRef,
      maxLength,
      selectedItems,
      inputValue,
      onKeyDown,
      autoFocus,
    } = this.props;

    return (
      <Downshift
        inputValue={inputValue}
        onChange={this.handleChange}
        selectedItem={selectedItems}
        defaultHighlightedIndex={0}
        itemToString={this.handleItemToString}
        id="downshift-multiple"
      >
        {({
          getInputProps,
          getItemProps,
          getRootProps,
          isOpen,
          highlightedIndex,
        }) => (
          <StyledDownshiftMultipleWrapper {...getRootProps()}>
            <JuiDownshiftTextField
              inputValue={inputValue}
              selectedItems={selectedItems}
              label={inputLabel}
              placeholder={inputPlaceholder}
              getInputProps={getInputProps}
              onInputChange={this.handleInputChange}
              onSelectChange={this.handleSelectChange}
              InputItem={InputItem}
              autoSwitchEmail={autoSwitchEmail}
              multiple={multiple}
              messageRef={messageRef}
              maxLength={maxLength}
              onKeyDown={onKeyDown}
              autoFocus={autoFocus}
            />
            {isOpen && suggestionItems.length ? (
              <JuiAutoSizer>
                {({ height }: Partial<Size>) => (
                  <StyledPaper
                    square={true}
                    data-test-automation-id={automationId}
                  >
                    {/* {height ? ( */}
                    <JuiVirtualizedList
                      height={height as any} // need supported by new virtualized list update
                      minRowHeight={minRowHeight}
                    >
                      {suggestionItems.map(
                        (suggestionItem: SelectedItem, index) => {
                          const isHighlighted = highlightedIndex === index;
                          return (
                            <MenuItem
                              {...getItemProps({ item: suggestionItem })}
                              itemId={suggestionItem.id}
                              key={suggestionItem.id}
                              isHighlighted={isHighlighted}
                            />
                          );
                        },
                      )}
                    </JuiVirtualizedList>
                    {/* ) : null} */}
                  </StyledPaper>
                )}
              </JuiAutoSizer>
            ) : null}
          </StyledDownshiftMultipleWrapper>
        )}
      </Downshift>
    );
  }
}

export { JuiDownshift, JuiDownshiftProps, JuiDownshiftKeyDownEvent };
