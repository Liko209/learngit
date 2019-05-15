/*
 * @Author: wayne.zhou
 * @Date: 2019-05-15 13:42:05
 * Copyright © RingCentral. All rights reserved.
 * this code is taken from https://github.com/storybooks/storybook/blob/master/addons/storyshots/storyshots-puppeteer/package.json
 * in order to make some customization
 */
import { toId } from '@storybook/router/utils';

import { URL } from 'url';

export const constructUrl = (storybookUrl, kind, story) => {
  const id = toId(kind, story);

  const storyUrl = `/iframe.html?id=${id}`;
  const { protocol, host, pathname, search } = new URL(storybookUrl);
  const pname = pathname.replace(/\/$/, ''); // removes trailing /
  const query = search.replace('?', '&'); // convert leading ? to &
  const url = `${protocol}//${host}${pname}${storyUrl}${query}`;
  return url;
};
