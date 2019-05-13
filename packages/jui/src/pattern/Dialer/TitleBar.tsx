/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-21 18:11:54
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import {
  spacing,
  typography,
  palette,
  height,
} from '../../foundation/utils/styles';

type Props = {
  Actions?: React.ComponentType[];
  Status?: React.ComponentType;
  label?: string;
};

const StyledTitleBar = styled('div')`
  && {
    color: ${palette('common', 'white')};
    padding: ${spacing(0, 4)};
    display: flex;
    justify-content: space-between;
    height: ${height(9)};
  }
`;

const StyledLeft = styled('div')`
  && {
    ${typography('body2')};
    display: flex;
    align-items: center;
  }
  && span {
    margin-right: ${spacing(2)};
  }
`;

const StyledRight = styled('div')`
  && {
    display: flex;
    align-items: center;
  }
  && button {
    margin-left: ${spacing(2)};
  }
`;

class JuiTitleBar extends PureComponent<Props> {
  render() {
    const { Actions, Status, label } = this.props;
    return (
      <StyledTitleBar data-test-automation-id="telephony-dialer-title">
        <StyledLeft data-test-automation-id="telephony-dialer-title-left">
          {Status && <Status />}
          {label && label}
        </StyledLeft>
        <StyledRight>
          {Actions &&
            Actions.map((Action: React.ComponentType) => (
              <Action key={Action.displayName} />
            ))}
        </StyledRight>
      </StyledTitleBar>
    );
  }
}

export { JuiTitleBar };
