/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-09 10:32:09
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { JuiIconography } from '../../../foundation/Iconography';
import { secondary, spacing } from '../../../foundation/utils';

const StyledIconographyDraft = styled(JuiIconography)`
  && {
    color: ${secondary('600')};
    font-size: ${spacing(3.5)};
    margin: ${spacing(0.5)};
  }
`;

const JuiIndicatorDraft = () => {
  return <StyledIconographyDraft>draft</StyledIconographyDraft>;
};

export { StyledIconographyDraft, JuiIndicatorDraft };
