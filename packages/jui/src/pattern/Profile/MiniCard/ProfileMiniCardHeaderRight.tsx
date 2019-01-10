/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-10 13:08:07
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing, width, height } from '../../../foundation/utils/styles';

type Props = {
  children?: any;
};

const Wrapper = styled('div')`
  display: inline-flex;
  margin-left: ${spacing(1.5)};
  margin-top: -${spacing(1)};
  margin-right: ${spacing(2.5)};
`;

const StyledAction = styled('span')`
  margin-left: ${spacing(2)};
  font-size: 0;
  width: ${width(4)};
  height: ${height(4)};
  &:first-child {
    margin-left: 0;
  }
`;

const JuiProfileMiniCardHeaderRight = ({ children }: Props) => {
  return (
    <Wrapper>
      {React.Children.toArray(children).map((child, index) => {
        return <StyledAction key={index}>{child}</StyledAction>;
      })}
    </Wrapper>
  );
};

export { JuiProfileMiniCardHeaderRight };
