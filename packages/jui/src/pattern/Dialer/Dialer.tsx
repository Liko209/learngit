import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { width } from '../../foundation/utils/styles';

type Props = {
  children: React.ReactNode;
};

const StyledDialer = styled('div')`
  && {
    width: ${width(70)};
    box-shadow: ${({ theme }) => theme.boxShadow.val16};
  }
`;

class JuiDialer extends PureComponent<Props> {
  render() {
    return <StyledDialer {...this.props} />;
  }
}

export { JuiDialer };
