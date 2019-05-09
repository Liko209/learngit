import React, { ReactElement } from 'react';
import styled from '../../../foundation/styled-components';
import { Theme } from '../../../foundation/styles';

import { IconButtonSize } from './utils/sizing';

type Children = ReactElement | ReactElement[];

type GroupProps = {
  children: Children,
  size: IconButtonSize,
};

const Wrapper = styled.div<{ size: IconButtonSize, theme: Theme }>`
  .inline-icon {
    display: inline-block;
  }
  display: inline-block;
  background-color: #ffffff;
`;

const Group = ({ children, size }: GroupProps) => {
  function injectIconSize(children: Children) {
    return React.Children.map(
      children,
      child => React.cloneElement(child, {
        size,
        className: 'inline-icon',
      }),
    );
  }
  return (
    <Wrapper size={size}>
      {injectIconSize(children)}
    </Wrapper>
  );
};

export default Group;
