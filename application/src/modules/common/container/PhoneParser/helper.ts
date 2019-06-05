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

function isValidPhoneNumber(content: string) {
  const IS_PHONE_NUMBER = /\+?(\d{1,4} ?)?((\(\d{1,4}\)|\d(( |\-)?\d){0,3})(( |\-)?\d){2,}|(\(\d{2,4}\)|\d(( |\-)?\d){1,3})(( |\-)?\d){1,})(( x| ext.?)\d{1,5}){0,1}/g.test(
    content,
  );
  const NUMBER_WITH_PLUS = 10;
  const MIN_PHONE_NUMBER_LENGTH = 7;
  const MAX_PHONE_NUMBER_LENGTH = 15;
  if (!content) return false;
  const noneSpecialChar = content.replace(/\+|\-|\(|\)|\s+/g, '');
  const phoneNumberLength = noneSpecialChar.length;
  if (content.indexOf('+') === 0 && IS_PHONE_NUMBER) {
    return (
      phoneNumberLength >= NUMBER_WITH_PLUS &&
      phoneNumberLength <= MAX_PHONE_NUMBER_LENGTH
    );
  }
  if (
    phoneNumberLength < MIN_PHONE_NUMBER_LENGTH ||
    phoneNumberLength > MAX_PHONE_NUMBER_LENGTH
  ) {
    return false;
  }
  return IS_PHONE_NUMBER;
}
function handleHrefAttribute(attr: { canUseTelephony: boolean, content: string}) {
  const { canUseTelephony, content } = attr;
  return isSupportWebRTC() && canUseTelephony
    ? 'javascript:;'
    : `rcmobile://call?number=${content}`;
}
export { isSupportWebRTC, isValidPhoneNumber, handleHrefAttribute };
