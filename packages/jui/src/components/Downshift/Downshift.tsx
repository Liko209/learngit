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
import {
  JuiVirtualizedList,
  IndexRange,
} from '../../components/VirtualizedList';
import { JuiAutoSizer, Size } from '../../components/AutoSizer';

type JuiDownshiftState = {
  isComposition: boolean;
  renderedRange: IndexRange;
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
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateY(100%);
    padding: ${spacing(2, 0)};
    width: 100%;
    max-height: ${height(45)};
    z-index: ${({ theme }) => `${theme.zIndex.drawer}`};
    overflow: hidden;
  }
`;

class JuiDownshift extends React.PureComponent<
  JuiDownshiftProps,
  JuiDownshiftState
> {
  state: JuiDownshiftState = {
    isComposition: false,
    renderedRange: { startIndex: 0, stopIndex: 0 },
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
  }
  handleInputChange = (value: string) => {
    this.props.onInputChange(value);
  }
  handleSelectChange = (items: SelectedItem[]) => {
    this.props.onSelectChange(items);
  }
  handleComposition = (isComposition: boolean) => {
    this.setState({ isComposition });
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
              onComposition={this.handleComposition}
              openMenu={openMenu}
            />
            {isOpen && suggestionItems.length > 0 ? (
              <StyledPaper square={true} data-test-automation-id={automationId}>
                <JuiAutoSizer>
                  {({ height }: Size) => (
                    <JuiVirtualizedList
                      height={height}
                      minRowHeight={minRowHeight}
                      onRenderedRangeChange={this._handleRenderedRangeChange}
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
                  )}
                </JuiAutoSizer>
              </StyledPaper>
            ) : null}
          </StyledDownshiftMultipleWrapper>
        )}
      </Downshift>
    );
  }

  private _handleRenderedRangeChange = (range: IndexRange) => {
    this.setState({ renderedRange: range });
  }
}

export { JuiDownshift, JuiDownshiftProps, JuiDownshiftKeyDownEvent };
