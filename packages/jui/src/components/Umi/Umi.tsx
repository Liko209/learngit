/*
 * Unread Message Indicator
 *
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:36:01
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled, { css } from '../../foundation/styled-components';
import {
  palette,
  secondary,
  grey,
  width,
  height,
  typography,
} from '../../foundation/utils/styles';

import { countToString, countToWidth } from './utils';

const styleHiddenWhenNoCount = css`
  visibility: ${({ unreadCount }: JuiUmiProps) =>
    unreadCount ? 'visible' : 'hidden'};
`;

const styleCount = css`
  ${typography('caption')};
  text-align: center;
  ${styleHiddenWhenNoCount};
`;

const styleDot = css`
  font-size: 0;
  height: 10px;
  width: 10px;
  line-height: 10px;
  color: transparent;
`;

const styleAuto = css`
  ${styleDot} ${styleHiddenWhenNoCount}

  li:hover > &,
  div:hover > & {
    ${({ variant }: JuiUmiProps) => variant === 'auto' && styleCount};
  }
`;

const styles = {
  count: styleCount,
  dot: styleDot,
  auto: styleAuto,
};

const StyledUmi = styled<JuiUmiProps, 'span'>('span').attrs({
  'aria-hidden': true,
} as any)`
  display: inline-block;
  width: ${({ unreadCount }) => width(countToWidth(unreadCount))};
  height: ${height(4)};
  border-radius: 12px;
  transition-property: font-size, height, line-height, color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  background: ${({ important }) => {
    return important ? secondary('main') : grey('500');
  }};
  color: ${() => {
    return palette('common', 'white');
  }};
  ${({ variant = 'count' }) => styles[variant]};
`;

type JuiUmiVariant = 'count' | 'dot' | 'auto';

type JuiUmiProps = {
  important?: boolean;
  unreadCount?: number;
  variant?: JuiUmiVariant;
};

class JuiUmi extends PureComponent<JuiUmiProps> {
  static defaultProps = {
    important: false,
    unreadCount: 0,
    variant: 'count',
  };

  render() {
    const text =
      this.props.variant === 'dot'
        ? '1'
        : countToString(this.props.unreadCount);
    return (
      <StyledUmi className="umi" {...this.props}>
        {text}
      </StyledUmi>
    );
  }
}

export { JuiUmiVariant, JuiUmiProps, JuiUmi };
