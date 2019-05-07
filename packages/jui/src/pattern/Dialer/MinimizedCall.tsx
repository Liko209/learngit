/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-30 17:33:54
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import tinycolor from 'tinycolor2';
import { JuiMarquee } from '../../components/Marquee';
import styled from '../../foundation/styled-components';
import {
  spacing,
  typography,
  palette,
  height,
  width,
  opacity,
} from '../../foundation/utils/styles';

type Props = {
  Actions: React.ComponentType<any>[];
  name: string;
  label: string;
  onClick?: () => void;
};

const StyledMinimizedCall = styled('div')`
  order: -1;
  box-sizing: border-box;
  background-color: ${({ theme }) =>
    tinycolor(palette('common', 'black')({ theme }))
      .setAlpha(opacity('p30')({ theme }))
      .toRgbString()};
  padding: ${spacing(0, 4)};
  width: ${width(60)};
  height: ${height(16)};
  display: flex;
  align-items: center;
  margin-right: ${spacing(3)};
  transition: box-shadow 0.2s ease;
  &:hover {
    cursor: pointer;
    box-shadow: ${props => props.theme.shadows[4]};
  }
`;

const StyledMarquee = styled(JuiMarquee)`
  ${typography('subheading2')};
  color: ${palette('common', 'white')};
`;

const StyledLabel = styled('div')`
  ${typography('body1')};
  color: ${palette('common', 'white')};
`;

const StyledInfo = styled('div')`
  width: ${width(30.5)};
  margin-right: ${spacing(2)};
`;

const StyledActionsContainer = styled('div')`
  display: flex;
  justify-content: space-between;
  width: ${width(19.5)};
`;

class JuiMinimizedCall extends PureComponent<Props> {
  render() {
    const { name, label, Actions, onClick, ...rest } = this.props;
    return (
      <StyledMinimizedCall onClick={onClick} {...rest}>
        <StyledInfo>
          <StyledMarquee text={name} time={15} hoverToStop={true} />
          <StyledLabel>{label}</StyledLabel>
        </StyledInfo>
        <StyledActionsContainer>
          {Actions &&
            Actions.map((Action: React.ComponentType, index: number) => (
              <Action
                key={Action.displayName || `minimized_view_actions_${index}`}
              />
            ))}
        </StyledActionsContainer>
      </StyledMinimizedCall>
    );
  }
}

export { JuiMinimizedCall };
