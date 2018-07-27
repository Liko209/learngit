/*
 * @Author: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Date: 2018-03-03 15:14:11
 * Copyright © RingCentral. All rights reserved.
 */
import 'sanitize.css';
import { injectGlobal } from 'styled-components';
import font from './font/proximanova-regular.woff';
import font0 from './font/proximanova0.woff';
import font1 from './font/proximanova1.woff';
import font2 from './font/proximanova2.woff';
import font3 from './font/proximanova3.woff';
import font4 from './font/proximanova4.woff';

injectGlobal`

  @font-face {
    font-family: 'proxima-nova';
    src: url('${font}') format('woff');
  }
  @font-face {
    font-family: 'proxima-nova0';
    src: url('${font0}') format('woff');
  }
  @font-face {
    font-family: 'proxima-nova1';
    src: url('${font1}') format('woff');
  }
  @font-face {
    font-family: 'proxima-nova2';
    src: url('${font2}') format('woff');
  }
  @font-face {
    font-family: 'proxima-nova3';
    src: url('${font3}') format('woff');
  }
  @font-face {
    font-family: 'proxima-nova4';
    src: url('${font4}') format('woff');
  }
  html,
  body {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    font-size: 15px;
    font-family: proxima-nova !important;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }
  * {
    -ms-overflow-style: -ms-autohiding-scrollbar;
  }
  /* body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  body.fontLoaded {
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  } */

  #root {
    height: 100%;
    width: 100%;
  }

  /* p,
  label {
    font-family: Georgia, Times, 'Times New Roman', serif;
    line-height: 1.5em;
  } */

  ::-webkit-scrollbar {
    width: 8px;
    background-color: rgba(245,245,245,.1);
    -webkit-border-radius: 100px
  }

  ::-webkit-scrollbar:hover {
      background-color: rgba(245,245,245,.15)
  }

  ::-webkit-scrollbar-thumb:vertical:hover {
      background: rgba(185,185,185,.6)
  }

  ::-webkit-scrollbar-thumb:vertical {
      background: rgba(185,185,185,.5);
      -webkit-border-radius: 100px
  }

  ::-webkit-scrollbar-thumb:vertical:active {
      background: rgba(185,185,185,.61);
      -webkit-border-radius: 100px
  }

  ::-webkit-scrollbar-thumb:horizontal:active {
      background: rgba(185,185,185,.61);
      -webkit-border-radius: 100px
  }

  ::-webkit-scrollbar:horizontal {
      height: 9px
  }

  :focus {
    outline: none;
  }


  #nprogress {
    pointer-events: none;
  }

  #nprogress .bar {
    background: #29d;

    position: fixed;
    z-index: 1031;
    top: 0;
    left: 0;

    width: 100%;
    height: 2px;
  }

  /* Fancy blur effect */
  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px #29d, 0 0 5px #29d;
    opacity: 1.0;

    -webkit-transform: rotate(3deg) translate(0px, -4px);
        -ms-transform: rotate(3deg) translate(0px, -4px);
            transform: rotate(3deg) translate(0px, -4px);
  }

  /* Remove these to get rid of the spinner */
  #nprogress .spinner {
    display: block;
    position: fixed;
    z-index: 1031;
    top: 15px;
    right: 15px;
  }

  #nprogress .spinner-icon {
    width: 18px;
    height: 18px;
    box-sizing: border-box;

    border: solid 2px transparent;
    border-top-color: #29d;
    border-left-color: #29d;
    border-radius: 50%;

    -webkit-animation: nprogress-spinner 400ms linear infinite;
            animation: nprogress-spinner 400ms linear infinite;
  }

  .nprogress-custom-parent {
    overflow: hidden;
    position: relative;
  }

  .nprogress-custom-parent #nprogress .spinner,
  .nprogress-custom-parent #nprogress .bar {
    position: absolute;
  }

  @-webkit-keyframes nprogress-spinner {
    0%   { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }
  @keyframes nprogress-spinner {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }


`;
