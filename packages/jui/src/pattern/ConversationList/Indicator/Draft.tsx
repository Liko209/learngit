/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-09 10:32:09
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { JuiIconography } from '../../../foundation/Iconography';

const StyledIconographyDraft = styled(JuiIconography)``;

const JuiIndicatorDraft = () => (
  <StyledIconographyDraft iconSize="small" iconColor={['secondary', '600']}>
    draft
  </StyledIconographyDraft>
);

export { StyledIconographyDraft, JuiIndicatorDraft };
