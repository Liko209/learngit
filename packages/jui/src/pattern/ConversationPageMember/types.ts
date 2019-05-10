/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-09 09:53:22
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ReactElement } from 'react';
import { IconButtonSize } from '../../components/Buttons';

type JuiConversationPageMemberProps = {
  onClick(event: React.MouseEvent): void;
  ariaLabel: string;
  title: string;
  children: ReactElement;
  size?: IconButtonSize;
};

export { JuiConversationPageMemberProps };
