/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-11 10:23:27
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../styled-components';
import { JuiConversationCardAvatarArea } from './ConversationCardAvatarArea';

type ConversationCardProps = {
  Avatar: React.ReactNode;
  children: React.ReactChild[];
};

const StyledRightSection = styled('div')`
  flex-grow: 1;
  overflow: hidden;
  min-width: 0;
`;
const StyledConversationCard = styled('div')`
  background-color: white;
  display: flex;
`;

const JuiConversationCard = ({ children, Avatar }: ConversationCardProps) => (
  <StyledConversationCard>
    <JuiConversationCardAvatarArea>
      {Avatar}
    </JuiConversationCardAvatarArea>
    <StyledRightSection>
      {children}
    </StyledRightSection>
  </StyledConversationCard>
);

export { JuiConversationCard };
export default JuiConversationCard;
