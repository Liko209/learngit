/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-19 11:24:11
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../foundation/styled-components';
import { spacing, grey, typography } from '../../foundation/utils';
import { JuiSearchInput } from '../SearchBar/SearchInput';
import {
  JuiDialogHeaderTitle,
  JuiDialogHeaderActions,
} from '../../components/Dialog';
import { JuiIconButton } from '../../components/Buttons';
import Downshift, { GetItemPropsOptions } from 'downshift';

export type SelectItem = {
  id: number;
};

export type GroupSearchProps<T> = {
  dialogTitle: string;
  onClose?: Function;
  searchPlaceHolder: string;
  listTitle: string;
  onClear: () => void;
  searchKey: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (item: T) => void;
  clearText: string;
  children: (props: {
    getItemProps: (options: GetItemPropsOptions<any>) => any;
    highlightedIndex: number | null;
  }) => React.ReactElement;
  closeIconTooltip: string;
  closeIconAriaLabel?: string;
};

const LIST_HEIGHT = '392px';

const StyledHeader = styled.div`
  padding: ${spacing(5, 6)};
  display: flex;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
`;
const StyledFixedTop = styled.div`
  padding: ${spacing(0, 6)};
`;

const StyledListWrapper = styled.div`
  flex-direction: column;
  height: ${LIST_HEIGHT};
`;

const StyledListTitle = styled.div`
  ${typography('caption2')};
  color: ${grey('600')};
  padding: ${spacing(5, 0, 3, 0)};
`;

function stateReducer(state: any, changes: any) {
  // this prevents the highlightIndex changing closed when the user
  // selects an item with a keyboard or mouse
  switch (changes.type) {
    case Downshift.stateChangeTypes.keyDownEnter:
    case Downshift.stateChangeTypes.clickItem:
      return {
        ...changes,
        isOpen: true,
        highlightedIndex: state.highlightedIndex,
      };
    default:
      return changes;
  }
}

export function JuiGroupSearch<T extends SelectItem>({
  children,
  dialogTitle,
  searchPlaceHolder,
  listTitle,
  onClear,
  searchKey,
  onInputChange,
  onSelectChange,
  clearText,
  closeIconTooltip,
  closeIconAriaLabel,
}: GroupSearchProps<T>) {
  return (
    <Downshift
      defaultHighlightedIndex={0}
      stateReducer={stateReducer}
      onChange={onSelectChange}
    >
      {({ getInputProps, getItemProps, highlightedIndex, getRootProps }) => {
        return (
          <Container {...getRootProps()}>
            <StyledHeader>
              <JuiDialogHeaderTitle>{dialogTitle}</JuiDialogHeaderTitle>
              <JuiDialogHeaderActions>
                <JuiIconButton
                  tooltipTitle={closeIconTooltip}
                  ariaLabel={closeIconAriaLabel}
                >
                  close
                </JuiIconButton>
              </JuiDialogHeaderActions>
            </StyledHeader>
            <StyledFixedTop>
              <JuiSearchInput
                onClear={onClear}
                clearText={clearText}
                showClear
                size="medium"
                withCloseIcon={false}
                InputProps={getInputProps({
                  placeholder: searchPlaceHolder,
                })}
                value={searchKey}
                onChange={onInputChange}
              />
              <StyledListTitle>{listTitle}</StyledListTitle>
            </StyledFixedTop>
            <StyledListWrapper>
              {children({ getItemProps, highlightedIndex })}
            </StyledListWrapper>
          </Container>
        );
      }}
    </Downshift>
  );
}
