/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-21 18:11:48
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
// import { lighten } from '@material-ui/core/styles/colorManipulator';
// import styled, { keyframes, css } from '../../foundation/styled-components';
import styled from '../../foundation/styled-components';
import { primary } from '../../foundation/utils/styles';
// import { Theme } from '../../foundation/theme/theme';

// const backgroundColor = (theme: Theme) => keyframes`
//   from { background-position: 0 0; }
//   to { background-position: -280px 0;
// `;

const StyledHeaderContainer = styled('div')`
  && {
    background-color: ${primary('light')};
    /* background: linear-gradient(
      to right,
      ${primary('light')},
      ${primary('light')}
    ); */
  }
`;

class JuiHeaderContainer extends PureComponent {
  render() {
    const { children } = this.props;
    return <StyledHeaderContainer>{children}</StyledHeaderContainer>;
  }
}

export { JuiHeaderContainer };
