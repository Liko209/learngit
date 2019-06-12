/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-09 12:36:01
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component, RefObject, createRef } from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import styled, { keyframes, css } from 'styled-components';
import { StyledHeaderNoPadding } from 'jui/pattern/Dialer';
import { height, spacing } from 'jui/foundation/utils';
import { FakeInputViewProps } from './types';

@observer
class FakeInputView extends Component<FakeInputViewProps> {
  private _containerRef: RefObject<any> = createRef();

  componentDidMount() {
    if (!this._containerRef.current) {
    }

    const el = ReactDOM.findDOMNode(this._containerRef.current);
    if (!el) {
      return;
    }

    // auto focus
    requestAnimationFrame(() => {
      if (this._containerRef.current) {
        (el as HTMLElement).focus();
      }
    });
  }

  // HACK: using `direction:rtl` and `unicode-bidi` while also reversing the input string
  render() {
    const { showCursor, enteredKeys } = this.props;
    const blink = keyframes`
      0% { opacity:1; }
      50% { opacity:0; }
      100% { opacity:1; }
    `;

    const blinkAnimation = () =>
      css`
        ${blink} 0.8s steps(1) infinite
      `;

    const FlexContainer = styled.div`
      flex-grow: 1;
      align-self: stretch;
      min-width: 0;
      outline: none;
    `;

    const Container = styled.div`
      width: 100%;
      height: 100%;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const Inner = styled.div`
      direction: rtl;
      overflow: hidden;
      color: white;
      font-size: ${({ theme }) => theme.typography.headline.fontSize};
      vertical-align: middle;
      height: 100%;
      display: flex;
      align-items: center;
      padding: ${spacing(0, 2)};

      &&:before {
        font-size: 1.75rem;
        display: inline-block;
        content: '';
        animation: ${showCursor ? blinkAnimation : undefined};
        width: 1px;
        height: ${height(8)};
        border-right: 1px solid ${showCursor ? 'white' : 'transparent'};
      }
    `;

    const KeyText = styled.div`
      width: 100%;
      overflow: hidden;
      min-width: 0;
      text-overflow: ellipsis;
      word-break: keep-all;
      white-space: nowrap;
      unicode-bidi: bidi-override;
    `;

    return (
      <FlexContainer tabIndex={0} ref={this._containerRef}>
        <StyledHeaderNoPadding>
          <Container>
            <Inner>
              <KeyText>{enteredKeys}</KeyText>
            </Inner>
          </Container>
        </StyledHeaderNoPadding>
      </FlexContainer>
    );
  }
}

export { FakeInputView };
