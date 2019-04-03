/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-03 17:10:17
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';

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

const JuiConversationPage = React.memo((props: JuiConversationPageProps) => (
  <StyledDiv {...props} />
));

export { JuiConversationPage, JuiConversationPageProps };
export default JuiConversationPage;
