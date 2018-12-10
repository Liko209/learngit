/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-08 09:21:03
 * Copyright © RingCentral. All rights reserved.
 */
import { LinkItem } from './';

function setLinkData(this: LinkItem, data: any) {
  const {
    summary,
    title,
    url,
    image,
    deactivated,
    do_not_render,
    data: detail,
    favicon,
  } = data;
  this.summary = summary || '';
  this.title = title || '';
  this.url = url;
  this.image = image || '';
  this.deactivated = deactivated;
  this.doNotRender = do_not_render || false;
  this.providerName = detail && detail.provider_name;
  this.favicon = favicon;
}

export { setLinkData };
