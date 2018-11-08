/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-11 10:23:27
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import { JuiConversationCardAvatarArea } from './ConversationCardAvatarArea';
import { grey } from '../../foundation/utils/styles';

type ConversationCardProps = {
  Avatar: React.ReactNode;
  children: (React.ReactChild | null)[];
} & React.DOMAttributes<{}>;

const StyledRightSection = styled('div')`
  position: relative;
  flex-grow: 1;
  min-width: 0;
`;
const StyledConversationCard = styled('div')`
  background-color: white;
  display: flex;
  transition: background-color 0.2s ease-in;
  &:hover {
    background-color: ${grey('100')};
  }
`;

const JuiConversationCard = ({
  children,
  Avatar,
  ...rest
}: ConversationCardProps) => (
  <StyledConversationCard {...rest}>
    <JuiConversationCardAvatarArea>{Avatar}</JuiConversationCardAvatarArea>
    <StyledRightSection>{children}</StyledRightSection>
  </StyledConversationCard>
);

export { JuiConversationCard };
export default JuiConversationCard;
