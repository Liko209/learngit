/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-26 10:21:00
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import { JuiDivider } from '../../components/Divider';
import {
  spacing,
  height,
  width,
  typography,
  grey,
} from '../../foundation/utils';

type JuiConversationInitialPostHeaderProps = {
  name?: JSX.Element;
  teamName?: string;
  description?: string;
  directMessageDescription?: string;
  isTeam: boolean;
};

const StyledConversationInitialPostHeader = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: ${spacing(4)};
`;

const StyledTitle = styled.div`
  display: flex;
  align-items: center;
  height: ${height(5)};
`;

const StyledSpan = styled.span`
  ${typography('body1')};
  color: ${grey('700')};
`;
const StyledTeamName = styled.span`
  ${typography('body2')};
  color: ${grey('900')};
`;
const StyledDescription = styled.div`
  max-width: ${width(119)};
  margin-top: ${spacing(2)};
  ${typography('body1')};
  color: ${grey('700')};
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JuiConversationInitialPostHeader = (
  props: JuiConversationInitialPostHeaderProps,
) => {
  const {
    isTeam,
    name,
    teamName,
    description,
    directMessageDescription,
  } = props;
  return (
    <React.Fragment>
      <StyledConversationInitialPostHeader>
        {isTeam ? (
          <StyledTitle>
            {name}
            <StyledSpan>&nbsp;created a team&nbsp;</StyledSpan>
            {<StyledTeamName>{teamName}</StyledTeamName>}
          </StyledTitle>
        ) : (
          <StyledSpan>{directMessageDescription}</StyledSpan>
        )}
        {isTeam && <StyledDescription>{description}</StyledDescription>}
      </StyledConversationInitialPostHeader>
      <JuiDivider />
    </React.Fragment>
  );
};

export { JuiConversationInitialPostHeader };
