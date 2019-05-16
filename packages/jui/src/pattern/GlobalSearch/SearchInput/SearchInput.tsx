/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 12:43:19
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo, useRef } from 'react';
import {
  JuiOutlineTextField,
  JuiOutlineTextFieldRef,
  JuiOutlineTextFieldProps,
} from '../../../components/Forms/OutlineTextField';
import styled from '../../../foundation/styled-components';
import { spacing, grey, typography, radius } from '../../../foundation/utils';

const StyledJuiOutlineTextField = styled(JuiOutlineTextField)`
  border-top: 0;
  border-right: 0;
  border-left: 0;
  border-top-left-radius: ${radius('xl')};
  border-top-right-radius: ${radius('xl')};
  border-color: ${grey('300')};
`;

const ClearButton = styled.span`
  padding: ${spacing(0, 3)};
  color: ${grey('600')};
  border-right: 1px solid ${grey('400')};
  ${typography('caption1')};
  cursor: pointer;
`;

type JuiGlobalSearchInputProps = {
  clearBtnText: string;
  showClear: boolean;
  onClear: () => void;
  onClose: () => void;
} & JuiOutlineTextFieldProps;

const JuiGlobalSearchInput = memo((props: JuiGlobalSearchInputProps) => {
  const { showClear, onClear, onClose, clearBtnText, ...rest } = props;

  const ref = useRef<JuiOutlineTextFieldRef>(null);
  const baseOnClear = () => {
    ref.current && ref.current.focus();
    onClear();
  };

  return (
    <StyledJuiOutlineTextField
      radiusType="rectangle"
      iconName={['search', 'close']}
      iconPosition="both"
      onClickIconRight={onClose}
      size="large"
      ref={ref as any}
      inputAfter={
        showClear && (
          <ClearButton
            data-test-automation-id="global-search-clear"
            onClick={baseOnClear}
          >
            {clearBtnText}
          </ClearButton>
        )
      }
      {...rest}
    />
  );
});

export { JuiGlobalSearchInput };
