/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-06-27 19:17:38
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import {
  spacing,
  height,
  width,
  grey,
  typography,
} from '../../foundation/utils';

type JuiEmptyPageProps = {
  image?: string;
  message?: string;
  children?: React.ReactNode;
};

const StyledEmptyPage = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: ${height(88)};
  padding: ${spacing(0, 8)};
`;

const StyledEmptyPageImage = styled.img`
  margin-top: ${height(18)};
  width: ${width(40)};
  height: ${height(31)};
`;

const StyledEmptyPageMessage = styled.span`
  margin-top: ${spacing(5)};
  text-align: center;
  ${typography('subheading1')};
  color: ${grey('900')};
`;

const JuiEmptyPageComponent = ({
  image = '',
  message = '',
  children,
  ...rest
}: JuiEmptyPageProps) => {
  const elImage = image ? <StyledEmptyPageImage src={image} /> : null;

  const elMessage = message ? (
    <StyledEmptyPageMessage>{message}</StyledEmptyPageMessage>
  ) : null;

  return (
    <StyledEmptyPage {...rest}>
      {elImage}
      {elMessage}
      {children}
    </StyledEmptyPage>
  );
};

const JuiEmptyPage = memo(JuiEmptyPageComponent);

export { JuiEmptyPage };
