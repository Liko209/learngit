/*
 * @Author: doyle.wu
 * @Date: 2019-07-11 17:13:28
 */

enum Selectors {
  contactItem = 'li[data-test-automation-id="conversation-list-item"]',
  dialpadBtn = 'button[data-test-automation-id="telephony-dialpad-btn"]',
  dialInput = 'div[data-test-automation-id="telephony-dialer-header"] input',
  callBtn = 'button[data-test-automation-id="telephony-dial-btn"]',
  seachListItemDialBtn = 'button[data-test-automation-id="telephony-contact-search-list_item-dial_button"]',
  keyPadBtn = 'div[data-test-automation-id="dialer-container"] > div > div > div > div:nth-child(2) button',
  toVoiceMailBtn = 'div[data-test-automation-id="dialer-container"] > div > div > div > button:nth-child(12)',
  endCallBtn = 'button[data-test-automation-id="telephony-end-btn"]',
}

export {
  Selectors
}
