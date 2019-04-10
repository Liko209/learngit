/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-21 18:11:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { width, spacing } from '../../foundation/utils/styles';

type Props = {
  children: React.ReactNode;
};

const StyledDialer = styled('div')`
  && {
    width: ${width(70)};
    margin: ${spacing(8)};
    box-shadow: ${({ theme }) => theme.boxShadow.val16};
    border-radius: ${({ theme }) => theme.radius.xl};
    overflow: auto;
  }
`;

class JuiDialer extends PureComponent<Props> {
  render() {
    return <StyledDialer {...this.props} />;
  }
}

export { JuiDialer };
