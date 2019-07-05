/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
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
import { IJuiEmptyPage } from './types';

const StyledEmptyPage = styled.div<{ pageHeight: number | string }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: ${width(84)};
  height: ${({ pageHeight }) =>
    typeof pageHeight === 'number' ? `${pageHeight}px` : pageHeight};
  padding: ${spacing(4, 8)};
  overflow: auto;

  > :first-child {
    margin-top: auto;
  }

  > :last-child {
    margin-bottom: auto;
  }
`;

const StyledEmptyPageImage = styled.img`
  margin-bottom: ${height(7)};
  width: ${width(67)};
  height: ${height(53)};
  flex-shrink: 0;
`;

const StyledEmptyPageMessage = styled.span`
  margin-bottom: ${height(3)};
  max-width: ${width(140)};
  min-width: 0;
  text-align: center;
  ${typography('subheading1')};
  color: ${grey('900')};
`;

const JuiEmptyPageComponent: IJuiEmptyPage = ({
  height = '100%',
  image = '',
  message = '',
  children = [],
  ...rest
}) => {
  const elImage = image ? <StyledEmptyPageImage src={image} /> : null;

  const elMessage = message ? (
    <StyledEmptyPageMessage>{message}</StyledEmptyPageMessage>
  ) : null;

  return (
    <StyledEmptyPage {...rest} pageHeight={height}>
      {elImage}
      {elMessage}
      {children}
    </StyledEmptyPage>
  );
};

const JuiEmptyPage = memo(JuiEmptyPageComponent);

export { JuiEmptyPage };
