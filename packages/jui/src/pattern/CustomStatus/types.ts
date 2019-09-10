/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-08-19 13:04:50
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

type JuiCustomStatusProps = {
  colons: string;
  emojiNode?: React.ReactNode;
  menuItems: {
    emoji: string;
    status: string;
  }[];
  onClear: () => void;
  onStatusItemClick: (
    evt: React.MouseEvent,
    item: {
      emoji: string,
      status: string,
    }
  ) => void;
  handleInputFocus: () => void;
  handleStatusChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showCloseBtn: boolean;
  isShowMenuList: boolean;
  value: string;
  placeHolder: string;
};
type JuiCustomStatusState = {
  showCloseBtn: boolean;
  value: string;
  colons: string;
};
export { JuiCustomStatusProps, JuiCustomStatusState };
