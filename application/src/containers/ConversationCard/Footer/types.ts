/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */

enum ERROR_TYPE {
  NETWORK,
  LIKE,
  UNLIKE,
}

type FooterProps = {
  id: number; // post id
};

type FooterViewProps = {
  isLike: boolean;
  likeCount: number;
  like: (event: React.MouseEvent<HTMLElement>) => void;
  unlike: (event: React.MouseEvent<HTMLElement>) => void;
  hasError: boolean;
  errType: ERROR_TYPE;
};

export { FooterProps, FooterViewProps, ERROR_TYPE };
