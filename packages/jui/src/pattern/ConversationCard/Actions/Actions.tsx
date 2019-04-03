/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-10 13:08:07
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing, width, height } from '../../../foundation/utils/styles';

type Props = {
  children: JSX.Element | (JSX.Element | null)[] | null;
};

const Wrapper = styled.span`
  margin: 0 ${spacing(1)};
  font-size: 0;
  width: ${width(4)};
  height: ${height(4)};
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
