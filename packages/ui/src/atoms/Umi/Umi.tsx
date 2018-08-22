/*
 * Unread Message Indicator
 *
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:36:01
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled, { css } from '../../styled-components';

import { countToString } from './utils';

const styleHiddenWhenNoCount = css`
  visibility: ${({ unreadCount }: UmiProps) => unreadCount ? 'visible' : 'hidden'};
`;

const styleCount = css`
  font-size: 12px;
  height: 16px;
  line-height: 16px;
  color: white;
  ${styleHiddenWhenNoCount}
`;

const styleDot = css`
  font-size: 0;
  height: 8px;
  line-height: 8px;
  color: transparent;
`;

const styleAuto = css`
  ${styleDot}
  ${styleHiddenWhenNoCount}

  li:hover > &,
  div:hover > & {
    ${({ variant }: UmiProps) => variant === 'auto' && styleCount}
  }
`;

const styles = {
  count: styleCount,
  dot: styleDot,
  auto: styleAuto,
};

const StyledUmi = styled<UmiProps, 'span'>('span')`
  display: inline-block;
  padding: 0 4px;
  border-radius: 8px;
  margin-right: 2px;
  transition-property: font-size, height, line-height, color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  background: ${ ({ important, theme }) => {
    const { primary, accent } = theme.palette;
    return important ? primary.main : accent.lake;
  }};
  ${({ variant = 'count' }) => styles[variant]}
`;

type UmiVariant = 'count' | 'dot' | 'auto';

type UmiProps = {
  important?: boolean;
  unreadCount?: number;
  variant?: UmiVariant;
};

class Umi extends PureComponent<UmiProps> {
  static defaultProps = {
    important: false,
    unreadCount: 0,
    variant: 'count',
  };

  render() {
    const text = this.props.variant === 'dot' ? '1' : countToString(this.props.unreadCount);

    return (
      <StyledUmi {...this.props}>
        {text}
      </StyledUmi>
    );
  }
}

export default Umi;
export { UmiVariant, UmiProps, Umi };
