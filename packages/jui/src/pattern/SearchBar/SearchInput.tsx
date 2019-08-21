/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-20 16:25:33
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo, useRef, forwardRef, useImperativeHandle } from 'react';
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
  showClear: boolean;
  onClear: () => void;
  onClose?: () => void;
  withCloseIcon?: boolean;
  size?: 'medium' | 'large';
} & JuiOutlineTextFieldProps;

const JuiSearchInput = memo(
  forwardRef((props: JuiSearchInputProps, ref) => {
    const {
      showClear,
      onClear,
      onClose,
      clearText,
      withCloseIcon = true,
      size = 'large',
      ...rest
    } = props;

    const inputRef = useRef<JuiOutlineTextFieldRef>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current && inputRef.current.focus();
      },
      element: inputRef.current && inputRef.current.element,
    }));

    const baseOnClear = () => {
      inputRef.current && inputRef.current.focus();
      onClear();
    };

    return (
      <JuiOutlineTextField
        iconName={withCloseIcon ? ['search', 'close'] : ['search']}
        iconPosition={withCloseIcon ? 'both' : 'left'}
        onClickIconRight={withCloseIcon ? onClose : undefined}
        size={size}
        ref={inputRef as any}
        inputAfter={
          showClear && (
            <ClearButton
              data-test-automation-id="global-search-clear"
              onClick={baseOnClear}
              withCloseIcon={withCloseIcon}
            >
              {clearText}
            </ClearButton>
          )
        }
        {...rest}
      />
    );
  }),
);

export { JuiSearchInput, JuiOutlineTextFieldRef, JuiSearchInputProps };
