/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 12:43:19
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import { JuiOutlineTextField } from '../../../components/Forms/TextField/OutlineTextField';
import styled from '../../../foundation/styled-components';

const StyledJuiOutlineTextField = styled(JuiOutlineTextField)`
  border-top: 0;
  border-right: 0;
  border-left: 0;
`;

const JuiGlobalSearchInput = memo(() => {
  return (
    <StyledJuiOutlineTextField
      radiusType="rectangle"
      iconName={['search', 'close']}
      iconPosition="both"
    />
  );
});

export { JuiGlobalSearchInput };
