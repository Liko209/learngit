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
  like: (event?: React.MouseEvent<HTMLElement>) => void;
  unlike: (event?: React.MouseEvent<HTMLElement>) => void;
  bookmark: (event?: React.MouseEvent<HTMLElement>) => void;
  removeBookmark: (event?: React.MouseEvent<HTMLElement>) => void;
  isOffline: boolean;
};

export { ActionsProps, ActionsViewProps };
