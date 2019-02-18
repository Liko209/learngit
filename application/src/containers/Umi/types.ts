/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:00
 * Copyright © RingCentral. All rights reserved.
 */

import { UMI_SECTION_TYPE } from 'sdk/module/state';

type UmiProps = {
  type: UMI_SECTION_TYPE;
  id?: number;
  global?: string;
};

type UmiViewProps = {
  unreadCount: number;
  important?: boolean;
};

export { UmiProps, UmiViewProps, UMI_SECTION_TYPE };
