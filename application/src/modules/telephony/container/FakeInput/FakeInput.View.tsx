/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-09 12:36:01
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled, { keyframes } from 'styled-components';
import { StyledHeaderNoPadding } from 'jui/pattern/Dialer';
import { height } from 'jui/src/foundation/utils/styles';
import { FakeInputViewProps } from './types';

@observer
class FakeInputView extends Component<FakeInputViewProps> {
  render() {
    const blink = keyframes`
      0% { opacity:1; }
      50% { opacity:0; }
      100% { opacity:1; }
    `;

    const FlexContainer = styled.div`
        flex-grow:1;
        align-self: stretch;
        min-width: 0;
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
          text-overflow: ellipsis;
          white-space: nowrap;
          word-break: keep-all;
          color: white;
          font-size: ${({ theme }) => theme.typography.headline.fontSize};
          vertical-align: middle;
          height: 100%;
          display: flex;
          align-items: center;

          &&:before{
            font-size: 1.75rem;
            display: inline-block;
            content: '';
            animation: ${blink} .8s steps(1) infinite;
            width: 1px;
            height: ${height(8)};
            border-right: 1px solid white;
        }
    `;

    return (
      <FlexContainer>
        <StyledHeaderNoPadding>
          <Container>
            <Inner>{this.props.enteredKeys}</Inner>
          </Container>
        </StyledHeaderNoPadding>
      </FlexContainer>
    );
  }
}

export { FakeInputView };
