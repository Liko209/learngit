/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-21 18:11:54
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
// @ts-ignore
import { JuiMarquee } from '../../components/Marquee';
import styled from '../../foundation/styled-components';
import {
  spacing,
  typography,
  palette,
  height,
} from '../../foundation/utils/styles';

type Props = {
  Avatar: React.ComponentType;
  Actions: React.ComponentType<any>[];
  name: string;
  phone?: string;
};

const StyledIncomingCall = styled('div')`
  position: relative;
  background-color: ${palette('common', 'white')};
`;

const StyledMarquee = styled(JuiMarquee)`
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
  padding: ${spacing(0, 6)};
`;

const StyledAction = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: ${spacing(18.5)};
  margin: ${spacing(0, 2, 6, 0)};

  &&:nth-child(even) {
    margin-right: ${spacing(0)};
  }
`;

const StyledActionsContainer = styled('div')`
  display: flex;
  justify-content: center;
  padding: ${spacing(0, 8)};
  flex-wrap: wrap;
`;

class JuiIncomingCall extends PureComponent<Props> {
  private _handleMouseDown(e: React.MouseEvent) {
    // prevent drag & drop
    e.stopPropagation();
    e.preventDefault();
  }
  render() {
    const { Avatar, name, phone, Actions } = this.props;
    return (
      <StyledIncomingCall>
        <Avatar />
        <StyledInfo>
          <StyledMarquee text={name} time={15} hoverToStop />
          {phone && <StyledPhone>{phone}</StyledPhone>}
        </StyledInfo>
        <StyledActionsContainer onMouseDown={this._handleMouseDown}>
          {Actions &&
            Actions.map((Action: React.ComponentType) => (
              <StyledAction key={Action.displayName}>
                <Action />
              </StyledAction>
            ))}
        </StyledActionsContainer>
      </StyledIncomingCall>
    );
  }
}

export { JuiIncomingCall };
