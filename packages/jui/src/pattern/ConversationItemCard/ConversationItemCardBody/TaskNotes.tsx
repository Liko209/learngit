/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 10:31:14
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';

type Props = {
  notes: string;
};

const StyledTaskNotes = styled.div`
  ${typography('body1')};
  color: ${grey('500')};
`;

const JuiTaskNotes = memo((props: Props) => (
  <StyledTaskNotes>{props.notes}</StyledTaskNotes>
));

JuiTaskNotes.displayName = 'JuiTaskNotes';

export { JuiTaskNotes };
