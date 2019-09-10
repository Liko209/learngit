/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-26 13:18:18
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { BUTTON_TYPE } from 'jui/pattern/Phone/VoicemailItem';
import { NavType, ContactType } from '../types';

type CallProps = {
  id: number;
  entity: NavType;
  contactType: ContactType;
  phoneNumber: string;
};

type CallViewProps = CallProps & {
  type: BUTTON_TYPE;
  isMe: boolean;
  doCall: (event: React.MouseEvent<HTMLElement, MouseEvent>) => Promise<void>;
};

export { CallProps, CallViewProps };
