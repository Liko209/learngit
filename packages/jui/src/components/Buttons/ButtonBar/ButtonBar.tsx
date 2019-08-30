/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-31 15:13:54
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled from '../../../foundation/styled-components';
import { Theme } from '../../../foundation/theme/theme';
import { spacing } from '../../../foundation/utils/styles';

type JuiButtonBarProps = {
  overlapSize: number;
  direction?: 'horizontal' | 'vertical';
  children: React.ReactNode;
} & {
  className?: string;
  style?: React.CSSProperties;
  isStopPropagation?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const padding = (theme: Theme, overlapSize?: number) =>
  overlapSize ? `${spacing(-overlapSize)({ theme })}` : '0';
/* eslint-disable react/prop-types */
const StyledButtonBar = styled<JuiButtonBarProps, 'div'>('div')`
  display: flex;
  flex-direction: ${({ direction }) =>
    direction === 'vertical' ? 'column' : 'row'};
  white-space: nowrap;
  flex-wrap: nowrap;
  flex-shrink: 0;
  align-items: center;

  && > *:nth-child(n + 2) {
    margin-left: ${({ theme, direction = 'horizontal', overlapSize }) =>
      direction === 'horizontal' && padding(theme, overlapSize)};

    margin-top: ${({ theme, direction = 'horizontal', overlapSize }) =>
      direction === 'vertical' && padding(theme, overlapSize)};
  }
`;

type IButtonBar = React.SFC<JuiButtonBarProps>;
const _JuiButtonBar: IButtonBar = ({
  children,
  isStopPropagation,
  onClick,
  ...rest
}) => {
  const _handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick && onClick(event);
    isStopPropagation && event.stopPropagation();
  };
  return (
    <StyledButtonBar onClick={_handleClick} {...rest}>
      {children}
    </StyledButtonBar>
  );
};

_JuiButtonBar.defaultProps = {
  overlapSize: 0,
  direction: 'horizontal',
};
const JuiButtonBar = React.memo(_JuiButtonBar);
export { JuiButtonBar, JuiButtonBarProps };
