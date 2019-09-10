/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-08-25 21:44:00
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import {
  typography,
  palette,
  spacing,
  ellipsis,
} from '../../foundation/shared/theme';

const colorMap = {
  primary: palette('secondary', 'main'),
  secondary: palette('grey', 400),
};
type RuiSpanProps = {
  color?: 'primary' | 'secondary';
};

const StyledTag = styled.span<RuiSpanProps>`
  display: inline-block;
  color: ${palette('common', 'white')};
  border-radius: ${spacing(2)};
  text-align: center;
  background-color: ${({ color = 'primary' }) => colorMap[color]};
  padding: ${spacing(0, 1)};
  ${typography('caption1')};
  margin-left: ${spacing(3)};
  min-width: ${spacing(11)};
  max-width: ${spacing(41)};
  ${ellipsis}
`;
type RuiTagProps = {
  content: string;
  color?: 'primary' | 'secondary';
};

const RuiTag = memo((props: RuiTagProps) => {
  const { color, content, ...rest } = props;

  return (
    <StyledTag color={color} {...rest}>
      {content}
    </StyledTag>
  );
});

RuiTag.displayName = 'RuiTag';
export { RuiTag, RuiTagProps };
