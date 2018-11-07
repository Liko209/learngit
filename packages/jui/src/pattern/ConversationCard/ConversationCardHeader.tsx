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
  min-width: 0;
  font-size: 0;
`;
const StyledName = styled('div')`
  color: ${grey('900')};
  ${typography('caption')} overflow: hidden;
  flex-shrink: 1;
  ${ellipsis()};
`;
const StyledStatus = styled('div')`
  margin-left: ${spacing(1)};
  color: ${grey('600')};
  flex-shrink: 1;
  white-space: nowrap;
  ${typography('caption2')} ${ellipsis()};
`;
const StyledTime = styled('div')`
  margin-left: ${spacing(2)};
  color: ${grey('700')};
  white-space: nowrap;
  ${typography('caption2')};
`;
const RightSection = styled('div')`
  margin-left: ${spacing(4)};
  display: inline-flex;
`;
const StyledConversationCardHeader = styled('div')`
  padding: ${spacing(4, 4, 2, 0)};
  display: flex;
  align-items: center;
`;

type ConversationCardHeaderProps = {
  name: string;
  status?: string;
  time: string;
  children?: React.ReactNode;
};

const JuiConversationCardHeader = (props: ConversationCardHeaderProps) => (
  <StyledConversationCardHeader>
    <StyledLeftSection>
      <StyledName data-name="name">{props.name}</StyledName>
      {props.status ? <StyledStatus>{props.status}</StyledStatus> : null}
      <StyledTime data-name="time">{props.time}</StyledTime>
    </StyledLeftSection>
    <RightSection>{props.children}</RightSection>
  </StyledConversationCardHeader>
);

export { JuiConversationCardHeader };
export default JuiConversationCardHeader;
