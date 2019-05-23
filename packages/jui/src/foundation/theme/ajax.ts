/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-08-30 08:38:29
 * Copyright © RingCentral. All rights reserved.
 */
function ajax(url: string, callback: (responseText: string, x: XMLHttpRequest) => void) {
  try {
    const x = new XMLHttpRequest;
    x.open('GET', url, true);
    x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    x.overrideMimeType('application/json');
    x.onreadystatechange = function () {
      x.readyState > 3 && callback && callback(x.responseText, x);
    };
    x.send();
  } catch (e) {
    window.console && console.error(e);
  }
}

export default ajax;
