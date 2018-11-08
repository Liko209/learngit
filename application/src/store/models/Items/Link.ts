/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-08 09:21:03
 * Copyright © RingCentral. All rights reserved.
 */
import { LinkItem } from './Link.type';

function setLinkData(this: LinkItem) {
  const { summary, title, url, image, deactivated, do_not_render } = this.data;
  this.summary = summary || '';
  this.title = title || '';
  this.url = url;
  this.image = image || '';
  this.deactivated = deactivated;
  this.doNotRender = do_not_render || false;
}

export { setLinkData };
