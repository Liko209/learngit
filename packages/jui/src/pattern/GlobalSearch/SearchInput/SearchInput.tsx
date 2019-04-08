/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 12:43:19
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import {
  JuiOutlineTextField,
  JuiOutlineTextFieldProps,
} from '../../../components/Forms/TextField/OutlineTextField';
import styled from '../../../foundation/styled-components';
import { spacing, grey, typography, radius } from '../../../foundation/utils';

const StyledJuiOutlineTextField = styled(JuiOutlineTextField)`
  border-top: 0;
  border-right: 0;
  border-left: 0;
  border-top-left-radius: ${radius('xl')};
  border-top-right-radius: ${radius('xl')};
`;

const ClearButton = styled.span`
  padding: ${spacing(0, 3)};
  color: ${grey('600')};
  border-right: 1px solid ${grey('400')};
  ${typography('caption1')};
`;

type JuiGlobalSearchInputProps = {
  showClear: boolean;
  onClear: () => void;
  onClose: () => void;
} & JuiOutlineTextFieldProps;

const JuiGlobalSearchInput = memo((props: JuiGlobalSearchInputProps) => {
  const { showClear, onClear, onClose, ...rest } = props;
  return (
    <StyledJuiOutlineTextField
      radiusType="rectangle"
      iconName={['search', 'close']}
      onClickIconRight={onClose}
      iconPosition="both"
      inputAfter={
        showClear && <ClearButton onClick={onClear}>Clear</ClearButton>}
      {...rest}
    />
  );
});

export { JuiGlobalSearchInput };
