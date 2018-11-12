/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 11:18:14
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { JuiIconButton } from '../../components/Buttons';

import { spacing, palette, height } from '../../foundation/utils/styles';

type Props = {
  moreTooltipTitle: string;
  Like: React.ReactNode;
  Bookmark: React.ReactNode;
};

const StyledWrapper = styled('div')`
  && {
    position: absolute;
    right: ${spacing(2)};
    top: ${spacing(1.5)};
    height: ${height(7)};
    padding: 0 ${spacing(1.5)};
    border-radius: ${spacing(4)};
    background-color: ${palette('common', 'white')};
    transition: box-shadow 0.3s ease-in;
    box-shadow: ${props => props.theme.shadows[1]};
    &:hover {
      box-shadow: ${props => props.theme.shadows[5]};
    }
    & > div {
      width: ${height(7)};
      text-align: center;
    }
  }
`;

class JuiConversationActionBar extends PureComponent<Props> {
  render() {
    const { moreTooltipTitle, Like, Bookmark } = this.props;
    return (
      <StyledWrapper>
        {Like}
        {Bookmark}
        <JuiIconButton
          size="small"
          tooltipTitle={moreTooltipTitle}
          variant="plain"
        >
          more_horiz
        </JuiIconButton>
      </StyledWrapper>
    );
  }
}

export { JuiConversationActionBar };
