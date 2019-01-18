/*
 * @Author: isaac.liu
 * @Date: 2019-01-16 20:44:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiIconography } from '../../foundation/Iconography';
import styled from '../../foundation/styled-components';
import { grey, width, height, spacing } from '../../foundation/utils';

const JuiIconWrapper = styled.div`
  background: ${grey('100')};
  width: ${width(9)};
  height: ${height(9)};
  border-radius: ${spacing(1)};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Wrapper = styled(JuiIconography)`
  color: ${grey('500')};
`;

const JuiNoteIcon = () => <Wrapper>notes</Wrapper>;

export { JuiNoteIcon, JuiIconWrapper };
