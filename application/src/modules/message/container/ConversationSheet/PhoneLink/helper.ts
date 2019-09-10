/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-04-30 09:07:10
 * Copyright © RingCentral. All rights reserved.
 */
function isSupportWebRTC() {
  return (
    window['RTCPeerConnection'] ||
    window['mozRTCPeerConnection'] ||
    window['webkitRTCPeerConnection'] ||
    navigator['webkitGetUserMedia'] ||
    navigator['mozGetUserMedia']
  );
}
/* eslint-disable */
function handleHrefAttribute(attr: {
  canUseTelephony: boolean;
  content: string;
}) {
  const { canUseTelephony, content } = attr;
  return isSupportWebRTC() && canUseTelephony
    ? ''
    : `rcmobile://call?number=${content}`;
}
export { isSupportWebRTC, handleHrefAttribute };
