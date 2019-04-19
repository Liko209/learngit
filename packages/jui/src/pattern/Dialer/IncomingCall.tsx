/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-21 18:11:54
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import {
  spacing,
  typography,
  palette,
  height,
} from '../../foundation/utils/styles';

type Props = {
  Ignore: React.ComponentType;
  Avatar: React.ComponentType;
  Actions: React.ComponentType<any>[];
  name: string;
  phone?: string;
};

const StyledIncomingCall = styled('div')`
  position: relative;
  background-color: ${palette('common', 'white')};
`;

const StyledIgnoreContainer = styled('div')`
  position: absolute;
  right: ${spacing(2)};
  top: ${spacing(1.5)};
`;

const StyledName = styled('div')`
  ${typography('headline')};
  color: ${palette('text', 'primary')};
  text-align: center;
`;

const StyledPhone = styled('div')`
  ${typography('body1')};
  color: ${palette('text', 'primary')};
  margin-top: ${spacing(2)};
  text-align: center;
`;

const StyledInfo = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: ${height(30)};
`;

const StyledActionsContainer = styled('div')`
  display: flex;
  justify-content: space-between;
  padding: ${spacing(0, 6, 3)};
`;

class JuiIncomingCall extends PureComponent<Props> {
  render() {
    const { Ignore, Avatar, name, phone, Actions } = this.props;
    return (
      <StyledIncomingCall>
        <StyledIgnoreContainer>
          <Ignore />
        </StyledIgnoreContainer>
        <Avatar />
        <StyledInfo>
          <StyledName>{name}</StyledName>
          {phone && <StyledPhone>{phone}</StyledPhone>}
        </StyledInfo>
        <StyledActionsContainer>
          {Actions &&
            Actions.map((Action: React.ComponentType) => (
              <Action key={Action.displayName} />
            ))}
        </StyledActionsContainer>
      </StyledIncomingCall>
    );
  }
}

export { JuiIncomingCall };
