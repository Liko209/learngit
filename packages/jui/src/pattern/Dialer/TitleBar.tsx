import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import {
  spacing,
  typography,
  palette,
  primary,
  height,
} from '../../foundation/utils/styles';

type Props = {
  Actions?: React.ComponentType[];
  Status?: React.ComponentType;
  label: string;
};

const StyledTitleBar = styled('div')`
  && {
    color: ${palette('common', 'white')};
    background-color: ${primary('light')};
    padding: ${spacing(0, 4)};
    display: flex;
    justify-content: space-between;
    height: ${height(9)};
  }
`;

const StyledLeft = styled('div')`
  && {
    ${typography('body1')};
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
      <StyledTitleBar>
        <StyledLeft>
          {Status && <Status />}
          {label}
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
