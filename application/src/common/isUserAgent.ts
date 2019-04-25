/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-12 16:57:23
 * Copyright © RingCentral. All rights reserved.
 */

const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
const isWindows = navigator.platform.indexOf('Win') > -1;
// @ts-ignore
const isEdge = document.documentMode || /Edge/.test(navigator.userAgent);
export { isElectron, isSafari, isFirefox, isWindows, isEdge };
