/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-26 10:56:11
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import { JuiPaper } from '../../components/Paper';

type JuiConversationInitialPostProps = {
  className?: string;
  children: (JSX.Element | null)[];
};

const StyledPaper = styled(JuiPaper)``;

const JuiConversationInitialPost = (props: JuiConversationInitialPostProps) => {
  return <StyledPaper {...props} />;
};

export { JuiConversationInitialPost };
