/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-26 10:56:31
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import {
  spacing,
  height,
  width,
  typography,
  grey,
} from '../../foundation/utils';

type JuiConversationInitialPostBodyProps = {
  image: string;
  text: string;
  content: string;
  actions: JSX.Element[];
};

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: ${spacing(9)};
`;
const StyledPic = styled.img`
  width: ${width(67)};
  height: ${height(53)};
  margin-bottom: ${spacing(7)};
`;
const StyledText = styled.div`
  ${typography('subheading1')};
  color: ${grey('900')};
  margin-bottom: ${spacing(2)};
`;
const StyledContent = styled.div`
  ${typography('body1')};
  color: ${grey('700')};
  margin-bottom: ${spacing(3)};
`;

const StyledActionWrapper = styled.div`
  margin: 0 ${spacing(2)} ${spacing(4)};
`;
const StyledActions = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

const JuiConversationInitialPostBody = (
  props: JuiConversationInitialPostBodyProps,
) => {
  return (
    <StyledWrapper>
      <StyledPic src={props.image} />
      <StyledText>{props.text}</StyledText>
      <StyledContent>{props.content}</StyledContent>
      <StyledActions>
        {props.actions.length
          ? props.actions.map((action, inx) => (
              <StyledActionWrapper key={inx}>{action}</StyledActionWrapper>
            ))
          : props.actions}
      </StyledActions>
    </StyledWrapper>
  );
};

export { JuiConversationInitialPostBody };
