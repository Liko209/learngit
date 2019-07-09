/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-03 17:10:17
 * Copyright © RingCentral. All rights reserved.
 */
import React, { forwardRef, RefObject } from 'react';
import styled from '../../foundation/styled-components';

type RefType = RefObject<any>;

type JuiConversationPageProps = {
  className?: string;
  children?: React.ReactNode[] | React.ReactNode;
};

const StyledDiv = styled<JuiConversationPageProps, 'div'>('div')`
  background-color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const JuiConversationPage = React.memo(
  forwardRef((props: JuiConversationPageProps, ref: RefType) => (
    <StyledDiv {...props} ref={ref} />
  )),
);

export { JuiConversationPage, JuiConversationPageProps };
export default JuiConversationPage;
