/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-09 10:34:33
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { JuiIconography } from '../../../foundation/Iconography';
import { palette, spacing } from '../../../foundation/utils';

const StyledIconographyFailure = styled(JuiIconography)`
  && {
    color: ${palette('semantic', 'negative')};
    font-size: ${spacing(4.5)};
  }
`;

const JuiIndicatorFailure = () => {
  return <StyledIconographyFailure>send_failure</StyledIconographyFailure>;
};

export { StyledIconographyFailure, JuiIndicatorFailure };
