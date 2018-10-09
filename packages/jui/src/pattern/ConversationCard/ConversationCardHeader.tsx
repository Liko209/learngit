/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-11 11:38:48
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { spacing, typography, grey, ellipsis } from '../../foundation/utils';
import styled from '../../foundation/styled-components';

const StyledLeftSection = styled('div')`
  flex-grow: 1;
  display: flex;
  ${typography('caption')} overflow: hidden;
  min-width: 0;
`;
const StyledName = styled('div')`
  color: ${grey('900')};
  ${ellipsis()} flex-shrink: 1;
`;
const StyledTime = styled('div')`
  margin-left: ${spacing(1)};
  color: ${grey('500')};
  white-space: nowrap;
`;
const RightSection = styled('div')`
  margin-left: ${spacing(4)};
`;
const StyledConversationCardHeader = styled('div')`
  padding: ${spacing(4, 4, 2, 0)};
  display: flex;
  align-items: center;
`;

type ConversationCardHeaderProps = {
  name: string;
  time: string;
  children?: React.ReactNode;
};

const JuiConversationCardHeader = (props: ConversationCardHeaderProps) => (
  <StyledConversationCardHeader>
    <StyledLeftSection>
      <StyledName>{props.name}</StyledName>
      <StyledTime>{props.time}</StyledTime>
    </StyledLeftSection>
    <RightSection>{props.children}</RightSection>
  </StyledConversationCardHeader>
);

export { JuiConversationCardHeader };
export default JuiConversationCardHeader;
