/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-20 16:25:33
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  memo,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import {
  JuiOutlineTextField,
  JuiOutlineTextFieldRef,
  JuiOutlineTextFieldProps,
} from '../../components/Forms/OutlineTextField';
import styled, { css } from '../../foundation/styled-components';
import { spacing, grey, typography } from '../../foundation/utils';

const withCloseIconStyle = css`
  border-right: 1px solid ${grey('400')};
  padding-right: ${spacing(3)};
`;
const ClearButton = styled.span<{ withCloseIcon: boolean }>`
  width: auto;
  text-align: right;
  padding-left: ${spacing(4)};
  color: ${grey('600')};
  ${({ withCloseIcon }) => (withCloseIcon ? withCloseIconStyle : '')};
  ${typography('caption1')};
  cursor: pointer;
`;

type JuiSearchInputProps = {
  clearText: string;
  onClear: () => void;
  onClose?: () => void;
  withCloseIcon?: boolean;
  size?: 'medium' | 'large';
} & JuiOutlineTextFieldProps;

const TWO_ICON = ['search', 'close'];
const ONE_ICON = ['search'];

const JuiSearchInput = memo(
  forwardRef((props: JuiSearchInputProps, ref) => {
    const {
      onClear,
      onClose,
      clearText,
      withCloseIcon = true,
      size = 'large',
      value,
      ...rest
    } = props;

    const inputRef = useRef<JuiOutlineTextFieldRef>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current && inputRef.current.focus();
      },
      element: inputRef.current && inputRef.current.element,
    }));

    const handleClearClick = useCallback(() => {
      inputRef.current && inputRef.current.focus();
      onClear();
    }, [inputRef]);

    const MemoClearButton = useMemo(
      () => (
        <ClearButton
          data-test-automation-id="search-input-clear"
          onClick={handleClearClick}
          withCloseIcon={withCloseIcon}
        >
          {clearText}
        </ClearButton>
      ),
      [handleClearClick, withCloseIcon, clearText, value],
    );

    return (
      <JuiOutlineTextField
        iconName={withCloseIcon ? TWO_ICON : ONE_ICON}
        iconPosition={withCloseIcon ? 'both' : 'left'}
        onClickIconRight={withCloseIcon ? onClose : undefined}
        size={size}
        ref={inputRef as any}
        inputAfter={value !== '' && MemoClearButton}
        value={value}
        {...rest}
      />
    );
  }),
);

export { JuiSearchInput, JuiOutlineTextFieldRef, JuiSearchInputProps };
