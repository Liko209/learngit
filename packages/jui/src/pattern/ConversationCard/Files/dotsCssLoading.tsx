/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-08-28 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { palette, spacing, opacity } from '../../../foundation/utils/styles';

const DotsLoadingContainer = styled.div`
  && {
    span {
      width: ${spacing(1)};
      height: ${spacing(1)};
      background-color: ${palette('common', 'black')};
      border-radius: 50%;
      display: inline-block;
      position: relative;
      margin: 0 ${spacing(0.5)};
    }

    span:nth-child(1) {
      animation: blink 1s forwards linear infinite;
    }

    span:nth-child(2) {
      animation: blink 0.5s forwards linear infinite 0.25s;
    }

    span:nth-child(3) {
      animation: blink 1s forwards linear infinite 0.5s;
    }
    @keyframes blink {
      0% {
        opacity: ${opacity('3')};
      }

      50% {
        opacity: 1;
      }

      100% {
        opacity: 0 ${opacity('3')};
      }
    }
  }
`;

export const DotsLoading = () => (
  <DotsLoadingContainer>
    <span />
    <span />
    <span />
  </DotsLoadingContainer>
);
