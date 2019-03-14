import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { primary } from '../../foundation/utils/styles';

const StyledHeaderContainer = styled('div')`
  && {
    background-color: ${primary('light')};
  }
`;

class JuiHeaderContainer extends PureComponent {
  render() {
    const { children } = this.props;
    return <StyledHeaderContainer>{children}</StyledHeaderContainer>;
  }
}

export { JuiHeaderContainer };
