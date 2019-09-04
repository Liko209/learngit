/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-08-20 10:05:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { JuiIconography } from '../../foundation/Iconography';
import {
  spacing,
  radius,
  typography,
  palette,
  width,
  height,
  ellipsis,
} from '../../foundation/utils/styles';

type JuiSwitchCallChipProps = {
  name: string;
  time: string;
  icon: string;
  active: boolean;
  onClick: (event?: React.MouseEvent) => void;
  EndCall?: React.ComponentType<any>;
};

type JuiSwitchCallHeaderProps = {
  children: React.ReactNode;
};

const StyledName = styled.span`
  max-width: ${width(26)};
  ${ellipsis()};
  margin-right: ${spacing(3)};
`;
const StyledTime = styled.span`
  flex: 1;
  margin-right: ${spacing(3)};
  text-align: right;
`;

const StyledHeader = styled('div')`
  && {
    color: ${palette('common', 'white')};
    padding: ${spacing(0, 3, 2)};
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    box-sizing: border-box;
    height: ${height(17)};
  }
`;

const StyledSwitchCallChipContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledSwitchCallChip = styled<{ active: boolean }, 'div'>('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing(1.5, 3)};
  width: ${width(54)};
  height: ${height(7)};
  box-sizing: border-box;
  ${typography('body1')};
  border-radius: ${radius('xxl')};
  margin-bottom: ${spacing(1)};
  background-color: ${({ active }) =>
    active ? palette('primary', '800', 0.6) : 'transparent'};
  &:hover {
    background-color: ${palette('primary', '800', 0.3)};
  }
  &:active {
    background-color: ${palette('primary', '800', 0.6)};
  }
`;

const JuiSwitchCallChip = (props: JuiSwitchCallChipProps) => {
  const { name, time, icon, EndCall, active, onClick } = props;
  return (
    <StyledSwitchCallChipContainer>
      <StyledSwitchCallChip active={active} onClick={onClick}>
        <StyledName>{name}</StyledName>
        <StyledTime>{time}</StyledTime>
        <JuiIconography iconSize="extraSmall">{icon}</JuiIconography>
      </StyledSwitchCallChip>
      {EndCall && <EndCall />}
    </StyledSwitchCallChipContainer>
  );
};

const JuiSwitchCallHeader = (props: JuiSwitchCallHeaderProps) => {
  const { children } = props;
  return <StyledHeader>{children}</StyledHeader>;
};

export { JuiSwitchCallChip, JuiSwitchCallHeader };
