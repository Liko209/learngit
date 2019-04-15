/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 09:59:00
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from '../../base/entity';

export type LinkItem = Item & {
  favicon: string;
  providerName: string;
  summary: string;
  title: string;
  url: string;
  image: string;
  data?: {
    provider_name: string;
    favicon_url: string;
    url: string;
    title: string;
    object: {
      duration?: number;
      width?: number;
      html?: string;
      type?: 'video';
      height?: number;
    };
  };
};
