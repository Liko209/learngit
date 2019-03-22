/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-10 13:08:07
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils/styles';

type Props = {
  children?: any;
};

const Wrapper = styled('div')`
  flex: 1;
  justify-content: flex-end;
  display: flex;
  button {
    margin-left: ${spacing(4)};
    &:first-child {
      margin-left: 0;
    }
  }
`;

const JuiProfileMiniCardFooterRight = memo(({ children }: Props) => {
  return <Wrapper>{children}</Wrapper>;
});

export { JuiProfileMiniCardFooterRight };
