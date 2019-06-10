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
  removePadding: boolean;
  CallAction?: React.ComponentType;
  KeypadActions: React.ComponentType[] | JSX.Element;
  keypadFullSize: boolean;
};

const StyledContainer = styled('div')<{ removePadding: boolean }>`
  && {
    background-color: ${palette('common', 'white')};
    padding: ${({ removePadding }) => (removePadding ? 0 : spacing(0, 6, 6))};
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
    removePadding: false,
    keypadFullSize: false,
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
    const {
      CallAction,
      KeypadActions,
      removeMargin,
      removePadding,
      keypadFullSize,
    } = this.props;

    const keypadActions = Array.isArray(KeypadActions)
      ? KeypadActions.map((Action: React.ComponentType) => (
          <Action key={Action.displayName} />
        ))
      : KeypadActions;

    return (
      <StyledContainer ref={this._containerRef} removePadding={removePadding}>
        <StyledKeypadActionsContainer>
          {keypadFullSize ? (
            keypadActions
          ) : (
            <StyledKeypadActions
              removeMargin={removeMargin}
              onMouseDown={this._stopPropagation}
            >
              {keypadActions}
            </StyledKeypadActions>
          )}
        </StyledKeypadActionsContainer>
        {CallAction && (
          <StyledCallAction onMouseDown={this._stopPropagation}>
            <CallAction />
          </StyledCallAction>
        )}
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

const ContactSearchContainer = styled.div<{}>`
  && {
    position: relative;
    width: 100%;
    position: relative;
    height: 100%;
    flex: 1;
    & > div:nth-child(2) {
      margin-top: ${spacing(11)};
      height: calc(100% - ${spacing(11)});
      overflow: hidden;
    }
  }
`;

// https://github.com/styled-components/styled-components/issues/1821
const ContactSearchItemContent = styled.div<{}>`
  && {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    overflow: hidden;

    & > *:nth-child(1) {
      flex: 1;
    }
    & > *:nth-child(2) {
      flex-basis: ${spacing(8)};
    }
  }
`;

export {
  JuiContainer,
  JuiKeypadAction,
  KeypadHeaderContainer,
  ContactSearchContainer,
  ContactSearchItemContent,
};
