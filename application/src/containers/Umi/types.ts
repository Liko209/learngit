/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:00
 * Copyright © RingCentral. All rights reserved.
 */

type UmiProps = {
  ids: number[];
  global?: string;
};

type UmiViewProps = {
  unreadCount: number;
  important?: boolean;
};

export { UmiProps, UmiViewProps };
