/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-09 10:34:33
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { JuiIconography } from '../../../foundation/Iconography';

const StyledIconographyFailure = styled(JuiIconography)``;

const JuiIndicatorFailure = () => {
  return (
    <StyledIconographyFailure
      iconSize="medium"
      iconColor={['semantic', 'negative']}
    >
      send_failure
    </StyledIconographyFailure>
  );
};

export { StyledIconographyFailure, JuiIndicatorFailure };
