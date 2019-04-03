/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */

type LikeProps = {
  id: number; // post id
};

type LikeViewProps = {
  isLike: boolean;
  like: (like: boolean) => Promise<void>;
};

export { LikeProps, LikeViewProps };
