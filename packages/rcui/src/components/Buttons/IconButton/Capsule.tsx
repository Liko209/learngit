import React, { ReactElement } from 'react';
import styled from '../../../foundation/styled-components';
import { Theme } from '../../../foundation/styles';

import { sizeMap } from './utils/sizing';
import { boxShadow } from './utils/tools';

type Children = ReactElement | ReactElement[];
type CapsuleSize = 'small' | 'medium' | 'large';

const CapsuleSizeMap = {
  small: {
    lr: 6,
    tb: 8,
  },
  medium: {
    lr: 10,
    tb: 10,
  },
  large: {
    lr: 10,
    tb: 12,
  },
};

type CapsuleProps = {
  children: Children,
  size: CapsuleSize,
};

const Wrapper = styled.div<{ size: CapsuleSize, theme: Theme }>`
  .inline-icon {
    display: inline-block;
    padding: 0px 6px;
    margin-top: ${({ size }) => size === 'small' ? '-1px' : 0}; // fix bug in small size
    box-sizing: content-box;
  }
  display: inline-block;
  background-color: #ffffff;
  padding: ${({ size }) => `${CapsuleSizeMap[size].tb}px ${CapsuleSizeMap[size].lr}px`};
  border-radius: ${({ size }) => `${sizeMap[size] + CapsuleSizeMap[size].lr}px`};
  box-shadow: ${({ theme }) => boxShadow(theme)};
`;

const Capsule = ({ children, size }: CapsuleProps) => {
  function injectIconSize(children: Children) {
    return React.Children.map(
      children,
      child => React.cloneElement(child, {
        size,
        className: 'inline-icon',
        awake: false,
        disableTouchRipple: true,
      }),
    );
  }
  return (
    <Wrapper size={size}>
      {injectIconSize(children)}
    </Wrapper>
  );
};

export default Capsule;
