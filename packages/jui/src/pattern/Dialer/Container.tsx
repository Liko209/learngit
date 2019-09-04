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
  CallAction?: React.ComponentType<any>[] | React.ComponentType<any>;
  CallerIdSelector?: React.ComponentType | JSX.Element | null;
  KeypadActions: React.ComponentType[] | JSX.Element;
  keypadFullSize: boolean;
  onFocus?: (e?: MouseEvent) => void;
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

const StyledCallActionBar = styled('div')<{ removePadding: boolean }>`
  && {
    display: flex;
    justify-content: space-between;
    align-self: center;
    width: 100%;
    padding: ${({ removePadding }) => (removePadding ? spacing(0, 6, 6) : 0)};
    box-sizing: ${({ removePadding }) =>
      removePadding ? 'border-box' : 'content-box'};
    cursor: pointer;
  }
`;

const StyledKeypadActionsContainer = styled('div')`
  && {
    flex: 1;
    display: flex;
    justify-content: center;
    flex-direction: column;
    position: relative;
    cursor: default;
    min-height: 0;
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

const JuiKeypadAction = styled.div<{ removeMargin?: boolean }>`
  && {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: ${width(16)};
    margin-bottom: ${({ removeMargin }) => (removeMargin ? 0 : spacing(5))};
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

const JuiTransferAction = styled('div')`
  && {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: ${spacing(6)};
    width: ${width(18.5)};
  }
`;

const JuiTransferActionText = styled.span<{ disabled?: boolean }>`
  && {
    color: ${grey('700')};
    ${typography('caption1')};
    margin-top: ${spacing(2)};
    opacity: ${({ theme, disabled }) => disabled && theme.opacity[1] * 3};
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

  componentDidMount() {
    if (this._containerRef.current) {
      this._containerRef.current.addEventListener(
        ANIMIATION_END_EVT,
        this._onFocus,
      );
    }
  }

  componentWillUnmount() {
    if (!this._containerRef.current) {
      return;
    }
    this._containerRef.current.removeEventListener(
      ANIMIATION_END_EVT,
      this._onFocus,
    );
  }
  _onFocus = (e: any) => {
    const { onFocus } = this.props;
    // prevent drag & drop
    e.stopPropagation();
    e.preventDefault();

    onFocus && onFocus(e);
  };

  render() {
    const {
      CallAction,
      KeypadActions,
      removeMargin,
      removePadding,
      keypadFullSize,
      CallerIdSelector,
    } = this.props;

    const keypadActions = Array.isArray(KeypadActions)
      ? KeypadActions.map((Action: React.ComponentType) => (
          <Action key={Action.displayName} />
        ))
      : KeypadActions;

    return (
      <StyledContainer ref={this._containerRef} removePadding={removePadding}>
        <StyledKeypadActionsContainer onMouseDown={this._onFocus}>
          {keypadFullSize ? (
            keypadActions
          ) : (
            <StyledKeypadActions
              removeMargin={removeMargin}
              onMouseDown={this._onFocus}
            >
              {keypadActions}
            </StyledKeypadActions>
          )}
          {CallerIdSelector}
        </StyledKeypadActionsContainer>
        {CallAction && Array.isArray(CallAction) ? (
          <StyledCallActionBar
            onMouseDown={this._onFocus}
            removePadding={removePadding}
          >
            {CallAction.map((Action: React.ComponentType) => (
              <Action key={Action.displayName} />
            ))}
          </StyledCallActionBar>
        ) : (
          <StyledCallAction onMouseDown={this._onFocus}>
            {CallAction && <CallAction />}
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

const ContactSearchContainer = styled.div<{ addMargin: boolean }>`
  && {
    position: relative;
    height: 100%;
    width: 100%;
    flex: 1;
    min-height: 0;
    & > .contact-search-list-container {
      margin-top: ${({ addMargin }) => (addMargin ? spacing(11) : 0)};
      height: ${({ addMargin, theme }) =>
        `calc(${addMargin ? `100% - ${spacing(11)({ theme })}` : '100%'})`};
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
  }
`;

// prettier-ignore
const CallerIdContainer = (elm: React.FunctionComponent<any>) => styled(elm)<{}>`
  && {
    position: absolute;
    top: ${spacing(1.5)};
    left: 0;
    right: 0;
    margin: auto;
    display: flex;
    flex-direction: horizontal;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    font-size: ${({ theme }) => theme.typography.body1.fontSize};
    padding-bottom: 0;

    & > div:nth-child(1) {
      padding-bottom: 0;
    }

    & > div:nth-child(2) {
      background: transparent;
      border: none;
      width: auto;
      font-size: ${({ theme }) => theme.typography.caption2.fontSize};
      margin-right: ${spacing(-3)};

      .select-input:focus {
        background-color: transparent;
      }
    }
  }
`;

export {
  JuiContainer,
  JuiKeypadAction,
  JuiTransferAction,
  JuiTransferActionText,
  KeypadHeaderContainer,
  ContactSearchContainer,
  ContactSearchItemContent,
  CallerIdContainer,
};
