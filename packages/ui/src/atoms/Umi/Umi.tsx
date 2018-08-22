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
  line-height: 18px;
  text-align: center;
  color: white;
  ${styleHiddenWhenNoCount}
`;

const styleDot = css`
  font-size: 0;
  height: 10px;
  width: 10px;
  line-height: 10px;
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
  width: ${ props => String(props.unreadCount).length === 1 ? 18 + 'px' : (String(props.unreadCount).length === 2 ? 22 + 'px' : 28 + 'px') };
  height: 18px;
  border-radius: 8px;
  margin-right: 2px;
  transition-property: font-size, height, line-height, color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  background: ${ ({ important }) => important ? '#ff8800' : '#69a3eb'};
  ${({ variant = 'count' }) => styles[variant]}
`;

type UmiProps = {
  important?: boolean;
  unreadCount?: number;
  variant?: 'count' | 'dot' | 'auto';
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
export { UmiProps, Umi };
