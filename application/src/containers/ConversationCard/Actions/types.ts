/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */

type ActionsProps = {
  id: number; // post id
};

type ActionsViewProps = {
  isLike: boolean;
  isBookmark: boolean;
  like: (like: boolean) => void;
  bookmark: (bookmark: boolean) => void;
  isOffline: boolean;
};

export { ActionsProps, ActionsViewProps };
