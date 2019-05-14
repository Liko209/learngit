/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-21 18:11:34
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent, RefObject, createRef } from 'react';
import styled from '../../foundation/styled-components';
import {
  spacing,
  palette,
  height,
  width,
  grey,
  typography,
} from '../../foundation/utils/styles';

type Props = {
  removeMargin: boolean;
  CallAction: React.ComponentType;
  KeypadActions: React.ComponentType[] | JSX.Element;
};

const StyledContainer = styled('div')`
  && {
    background-color: ${palette('common', 'white')};
    padding: ${spacing(0, 6, 6)};
    box-sizing: border-box;
    height: ${height(99)};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

const StyledCallAction = styled('div')`
  && {
    align-self: center;
  }
`;

const StyledKeypadActionsContainer = styled('div')`
  && {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
  }
`;

const StyledKeypadActions = styled.div<{ removeMargin: boolean }>`
  && {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: ${({ removeMargin, theme }) =>
      removeMargin ? spacing(-5)({ theme }) : 0};
  }
`;

const JuiKeypadAction = styled('div')`
  && {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: ${width(16)};
    margin-bottom: ${spacing(5)};
    & > span {
      color: ${grey('700')};
      ${typography('caption1')};
      &.disabled {
        color: ${({ theme }) =>
          palette('action', 'disabledBackground')({ theme })};
      }
    }
  }
`;

const ANIMIATION_END_EVT = 'animationend';

class JuiContainer extends PureComponent<Props> {
  _containerRef: RefObject<any> = createRef();
  static defaultProps = {
    removeMargin: true,
  };

  state = {
    showHoverActions: false,
  };

  _stopPropagation = (e: any) => {
    // prevent drag & drop
    e.stopPropagation();
  }

  componentDidMount() {
    if (this._containerRef.current) {
      this._containerRef.current.addEventListener(
        ANIMIATION_END_EVT,
        this._stopPropagation,
      );
    }
  }

  componentWillUnmount() {
    if (!this._containerRef.current) {
      return;
    }
    this._containerRef.current.removeEventListener(
      ANIMIATION_END_EVT,
      this._stopPropagation,
    );
  }

  render() {
    const { CallAction, KeypadActions, removeMargin } = this.props;
    return (
      <StyledContainer ref={this._containerRef}>
        <StyledKeypadActionsContainer>
          <StyledKeypadActions
            removeMargin={removeMargin}
            onMouseDown={this._stopPropagation}
          >
            {Array.isArray(KeypadActions)
              ? KeypadActions.map((Action: React.ComponentType) => (
                  <Action key={Action.displayName} />
                ))
              : KeypadActions}
          </StyledKeypadActions>
        </StyledKeypadActionsContainer>
        <StyledCallAction onMouseDown={this._stopPropagation}>
          <CallAction />
        </StyledCallAction>
      </StyledContainer>
    );
  }
}

const KeypadHeaderContainer = styled.div`
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing(0, 9, 1, 5)};
`;

export { JuiContainer, JuiKeypadAction, KeypadHeaderContainer };
