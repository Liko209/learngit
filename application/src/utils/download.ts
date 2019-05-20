/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-09 15:13:39
 * Copyright © RingCentral. All rights reserved.
 */

// workaround for prevent triggering "onbeforeunload" event when download file.
// Solution: https://stackoverflow.com/questions/2452110/download-binary-without-triggering-onbeforeunload
const iframeDownloader = (id: string, url: string) => {
  let _iframe: HTMLIFrameElement | null = document.querySelector(`#${id}`);
  if (!_iframe) {
    _iframe = document.createElement('iframe');
    _iframe.id = id;
    _iframe.style.display = 'none';
    document.body.appendChild(_iframe);
  }
  _iframe.src = url;
};

export { iframeDownloader };
