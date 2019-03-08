import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import {
  spacing,
  typography,
  palette,
  primary,
  height,
  ellipsis,
} from '../../foundation/utils/styles';

type Props = {
  Back?: React.ComponentType;
  HoverActions?: React.ComponentType;
  Avatar: React.ComponentType;
  name: string;
  phone?: string;
};

type State = {
  showHoverActions: boolean;
};

const StyledBack = styled('div')`
  margin-right: ${spacing(3)};
`;

const StyledInfoContainer = styled('div')`
  margin-left: ${spacing(3)};
  ${ellipsis()};
`;

const StyledName = styled('div')`
  ${typography('body2')};
  ${ellipsis()};
`;

const StyledPhone = styled('div')`
  ${typography('caption1')};
  ${ellipsis()};
`;

const StyledHeader = styled('div')`
  && {
    color: ${palette('common', 'white')};
    background-color: ${primary('light')};
    padding: ${spacing(1, 4, 3)};
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    height: ${height(14)};
  }
`;

const StyledLeft = styled('div')`
  && {
    ${typography('body2')};
    display: flex;
    align-items: center;
    width: 100%;
  }
  && caption {
    ${typography('caption2')};
  }
`;

const StyledRight = styled('div')`
  && {
    display: flex;
    align-items: center;
  }
`;

class JuiHeader extends PureComponent<Props, State> {
  state = {
    showHoverActions: false,
  };

  private _handleMouseEvent = () => {
    const { HoverActions } = this.props;
    const { showHoverActions } = this.state;
    if (HoverActions) {
      this.setState({
        showHoverActions: !showHoverActions,
      });
    }
  }

  render() {
    const { showHoverActions } = this.state;
    const { Back, Avatar, name, phone, HoverActions } = this.props;
    return (
      <StyledHeader
        onMouseEnter={this._handleMouseEvent}
        onMouseLeave={this._handleMouseEvent}
      >
        <StyledLeft>
          {Back && (
            <StyledBack>
              <Back />
            </StyledBack>
          )}
          <Avatar />
          <StyledInfoContainer>
            <StyledName>{name}</StyledName>
            {phone && <StyledPhone>{phone}</StyledPhone>}
          </StyledInfoContainer>
        </StyledLeft>
        {HoverActions && showHoverActions && (
          <StyledRight>
            <HoverActions />
          </StyledRight>
        )}
      </StyledHeader>
    );
  }
}

export { JuiHeader };
