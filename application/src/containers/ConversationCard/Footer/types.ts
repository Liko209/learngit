/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */

type FooterProps = {
  id: number; // post id
};

type FooterViewProps = {
  isLike: boolean;
  likeCount: number;
  like: (like: boolean) => void;
  isOffline: boolean;
};

export { FooterProps, FooterViewProps };
