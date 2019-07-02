/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-26 09:53:25
 * Copyright © RingCentral. All rights reserved.
 */
import { ChildrenType } from '@/common/postParser';

type TextMessageProps = {
  id: number; // post id
  keyword: string;
};

type TextMessageViewProps = {
  content: ChildrenType;
};

export { TextMessageProps, TextMessageViewProps };
