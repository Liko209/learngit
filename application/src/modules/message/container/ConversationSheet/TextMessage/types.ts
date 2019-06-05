/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-26 09:53:25
 * Copyright © RingCentral. All rights reserved.
 */
import { ChildrenType } from '@/common/postParser';

type TextMessageProps = {
  id: number; // post id
};

type TextMessageViewProps = {
  getContent: (keyword?: string) => ChildrenType;
  directCall: (phoneNumber: string) => void;
  canUseTelephony: () => Promise<boolean>;
};

export { TextMessageProps, TextMessageViewProps };
