/*
 * @Author: isaac.liu
 * @Date: 2019-04-08 18:29:14
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { spacing, width, height, grey } from '../../foundation/utils';
import { JuiMemberListEmptyViewProps } from './types';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: ${spacing(7, 0, 10, 0)};
`;

const SvgImage = styled.img`
  width: ${width(50)};
  height: ${height(40)};
  margin-bottom: ${spacing(5)};
`;

const SubText = styled.div`
  font-size: ${({ theme }) => theme.typography.subheading1};
  color: ${grey('900')};
`;

const JuiMemberListEmptyView = (props: JuiMemberListEmptyViewProps) => (
  <Wrapper>
    <SvgImage src={props.image} />
    <SubText>{props.subText}</SubText>
  </Wrapper>
);

export { JuiMemberListEmptyView };
