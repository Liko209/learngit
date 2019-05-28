/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 19:01:00
 * Copyright © RingCentral. All rights reserved.
 */

enum UMI_SECTION_TYPE {
  SINGLE,
  FAVORITE,
  DIRECT_MESSAGE,
  TEAM,
  ALL,
}

type UmiProps = {
  type: UMI_SECTION_TYPE;
  id?: number;
  global?: string;
};

type UmiViewProps = {
  unreadCount: number;
  important?: boolean;
};

type UnreadCounts = {
  unreadCount: number;
  mentionCount: number;
};

export { UMI_SECTION_TYPE, UmiProps, UmiViewProps, UnreadCounts };
