/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-19 11:24:11
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useCallback, useRef } from 'react';
import styled from '../../foundation/styled-components';
import { spacing, grey, typography } from '../../foundation/utils';
import { JuiSearchInput } from '../SearchBar/SearchInput';
import {
  JuiDialogHeaderTitle,
  JuiDialogHeaderActions,
  JuiDialogHeader,
} from '../../components/Dialog';
import { JuiIconButton } from '../../components/Buttons';
import Downshift, { GetItemPropsOptions, DownshiftInterface } from 'downshift';

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
  onDialogClose: () => void;
  itemCount: number;
  onKeyDownEscape: () => void;
  /**
   * needed for downshift to transform item to string
   */
  itemToString: (item: T) => string;
};

const LIST_HEIGHT = '392px';

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
  onDialogClose,
  itemCount,
  onKeyDownEscape,
  itemToString,
}: GroupSearchProps<T>) {
  const ref = useRef<DownshiftInterface<any>>(null);
  const _onInputChange = useCallback(
    e => {
      if (ref && ref.current) {
        // @ts-ignore
        ref.current.setHighlightedIndex(0);
        onInputChange(e);
      }
    },
    [onInputChange],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<any>) => {
      if (e.key === 'Escape') {
        // Prevent Downshift's default 'escape' behavior.
        // @ts-ignore
        e.nativeEvent.preventDownshiftDefault = true;
        onKeyDownEscape();
      }
    },
    [onKeyDownEscape],
  );

  const stateReducer = useCallback(
    function stateReducer(state: any, changes: any) {
      // this prevents the highlightIndex changing closed when the user
      // selects an item with a keyboard or mouse
      switch (changes.type) {
        case Downshift.stateChangeTypes.keyDownSpaceButton:
        case Downshift.stateChangeTypes.keyDownEscape:
        case Downshift.stateChangeTypes.blurInput:
          return {};
        case Downshift.stateChangeTypes.keyDownEnter:
        case Downshift.stateChangeTypes.clickItem:
          return {
            ...changes,
            isOpen: true,
            highlightedIndex: state.highlightedIndex,
          };
        case Downshift.stateChangeTypes.keyDownArrowUp: {
          if (state.highlightedIndex === 0) {
            return {};
          }
          return changes;
        }
        case Downshift.stateChangeTypes.keyDownArrowDown: {
          if (state.highlightedIndex === itemCount - 1) {
            return {};
          }
          return changes;
        }

        default: {
          return changes;
        }
      }
    },
    [itemCount],
  );

  return (
    <Downshift
      defaultHighlightedIndex={0}
      initialHighlightedIndex={0}
      stateReducer={stateReducer}
      onChange={onSelectChange}
      initialIsOpen
      itemCount={itemCount}
      ref={ref}
      itemToString={itemToString}
    >
      {({ getInputProps, getItemProps, highlightedIndex, getRootProps }) => {
        return (
          <Container data-test-automation-id="groupSearch" {...getRootProps()}>
            <JuiDialogHeader>
              <JuiDialogHeaderTitle data-test-automation-id="groupSearchTitle">
                {dialogTitle}
              </JuiDialogHeaderTitle>
              <JuiDialogHeaderActions>
                <JuiIconButton
                  tooltipTitle={closeIconTooltip}
                  ariaLabel={closeIconAriaLabel}
                  onClick={onDialogClose}
                  data-test-automation-id="groupSearchCloseButton"
                >
                  close
                </JuiIconButton>
              </JuiDialogHeaderActions>
            </JuiDialogHeader>
            <StyledFixedTop>
              <JuiSearchInput
                onClear={onClear}
                clearText={clearText}
                size="medium"
                withCloseIcon={false}
                InputProps={{
                  ...getInputProps({
                    onKeyDown,
                    placeholder: searchPlaceHolder,
                    autoFocus: true,
                  }),
                  'data-test-automation-id': 'groupSearchInput',
                }}
                value={searchKey}
                onChange={_onInputChange}
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
