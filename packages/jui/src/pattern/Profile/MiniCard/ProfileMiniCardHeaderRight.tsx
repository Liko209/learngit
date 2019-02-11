/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-10 13:08:07
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ReactChild } from 'react';
import styled from '../../../foundation/styled-components';
import { spacing, height } from '../../../foundation/utils/styles';

type Props = {
  children: ReactChild[] | ReactChild;
};

const Wrapper = styled('div')`
  display: inline-flex;
  margin-top: ${spacing(-1.5)};
  height: ${height(8)};
  && > * {
    margin-right: ${spacing(-2.5)};
  }
`;

const JuiProfileMiniCardHeaderRight = ({ children }: Props) => {
  return (
    <Wrapper>
      {React.Children.map(children, (child: ReactChild) => {
        return child;
      })}
    </Wrapper>
  );
};

export { JuiProfileMiniCardHeaderRight };
