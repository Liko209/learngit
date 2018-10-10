/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-10 13:08:07
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';

type Props = {
  children?: (boolean | JSX.Element)[] | boolean | JSX.Element;
};

const Wrapper = styled.span`
  margin: ${({ theme }) => theme.spacing.unit}px;
`;

const JuiActions = ({ children }: Props) => {
  return (
    <React.Fragment>
      {React.Children.toArray(children).map((child, index) => {
        return <Wrapper key={index}>{child}</Wrapper>;
      })}
    </React.Fragment>
  );
};

export { JuiActions };
