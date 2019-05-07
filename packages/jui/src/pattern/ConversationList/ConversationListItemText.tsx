/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:35:05
 * Copyright © RingCentral. All rights reserved.
 */
import React, { CSSProperties, PureComponent } from 'react';
import MuiTypography from '@material-ui/core/Typography';
import styled from '../../foundation/styled-components';
import { spacing, typography } from '../../foundation/utils';

const StyledMuiTypography = styled(MuiTypography)`
  && {
    flex: 1;
    padding: ${spacing(0, 3, 0, 2)};
    ${typography('body2')};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: inherit;
    z-index: ${({ theme }) => theme.zIndex.elementOnRipple};
  }
`;

type ItemTextProps = {
  style?: CSSProperties;
};

class ConversationListItemText extends PureComponent<ItemTextProps> {
  render() {
    const { children, ...rest } = this.props;
    return (
      <StyledMuiTypography {...rest}>{this.props.children}</StyledMuiTypography>
    );
  }
}

export default ConversationListItemText;
export { ItemTextProps, ConversationListItemText };
