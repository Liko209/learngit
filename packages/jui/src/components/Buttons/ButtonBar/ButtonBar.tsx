/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-08-31 15:13:54
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled, { css } from '../../../foundation/styled-components';
import { Theme } from '../../../foundation/theme/theme';
import { spacing } from '../../../foundation/utils/styles';

type JuiButtonBarProps = {
  overlapSize: number;
  direction?: 'horizontal' | 'vertical';
} & {
  className?: string;
  style?: React.CSSProperties;
};

const padding = (theme: Theme, overlapSize?: number) => {
  return overlapSize && overlapSize > 0
    ? `-${spacing(overlapSize)({ theme })}`
    : `${spacing(2)({ theme })}`;
};

const StyledButtonBar = styled<JuiButtonBarProps, 'div'>('div')`
  display: flex;
  flex-direction: ${({ direction }) =>
    direction === 'vertical' ? 'column' : 'row'};
  white-space: nowrap;
  flex-wrap: nowrap;
  flex-shrink: 0;

  ${({ overlapSize }) => {
    return (
      overlapSize > 0 &&
      css`
        && > *:nth-child(n + 2) {
          margin-left: ${({ theme, direction = 'horizontal', overlapSize }) =>
            direction === 'horizontal' && padding(theme, overlapSize)};

          margin-top: ${({ theme, direction = 'horizontal', overlapSize }) =>
            direction === 'vertical' && padding(theme, overlapSize)};
        }
      `
    );
  }}
`;

type IButtonBar = React.SFC<JuiButtonBarProps>;
const _JuiButtonBar: IButtonBar = ({ children, ...rest }) => {
  return <StyledButtonBar {...rest}>{children}</StyledButtonBar>;
};

_JuiButtonBar.defaultProps = {
  overlapSize: 0,
  direction: 'horizontal',
};
const JuiButtonBar = React.memo(_JuiButtonBar);
export { JuiButtonBar, JuiButtonBarProps };
