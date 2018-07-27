/*
 * @Author: Lily.li (lily.li@ringcentral.com)
 * @Date: 2018-05-15 15:21:00
 * @Last Modified by: Lily.li (lily.li@ringcentral.com)
 * @Last Modified time: 2018-05-16 09:25:32
 */

import styled from 'styled-components';

const SIZE = '14px';
const Icon = styled.i`
  color: #bbb;
  float: left;
  font-size: ${SIZE};
  height: ${SIZE};
  margin-right: 7px;
  width: ${SIZE};
  overflow: hidden;

  &:before {
    display: inline-block;
    height: ${SIZE};
    font-family: ico-font !important;
    speak: none;
    font-style: normal;
    font-weight: 400;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export default Icon;
