/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-26 10:21:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiDivider } from '../../components/Divider';
import { spacing, typography, grey, width } from '../../foundation/utils';

type JuiConversationInitialPostHeaderProps = {
  children?: JSX.Element | (JSX.Element | null)[];
};

const StyledConversationInitialPostHeader = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: ${spacing(4)};
`;

const StyledTitle = styled.div`
  max-width: ${width(106)};
  text-align: center;
`;

const StyledSpan = styled.span`
  display: inline-block;
  ${typography('body1')};
  color: ${grey('700')};
  word-break: break-all;
`;
const StyledTeamName = styled.span`
  ${typography('body2')};
  color: ${grey('900')};
  word-break: break-word;
`;
const StyledDescription = styled.div`
  max-width: ${width(119)};
  margin-top: ${spacing(2)};
  ${typography('body1')};
  color: ${grey('700')};
  text-align: center;
  word-break: break-word;
`;

const JuiConversationInitialPostHeader = React.memo(
  (props: JuiConversationInitialPostHeaderProps) => {
    const { children } = props;
    return (
      <React.Fragment>
        <StyledConversationInitialPostHeader>
          {children}
        </StyledConversationInitialPostHeader>
        <JuiDivider />
      </React.Fragment>
    );
  },
);

export {
  JuiConversationInitialPostHeader,
  StyledTitle,
  StyledSpan,
  StyledTeamName,
  StyledDescription,
};
