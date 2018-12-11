/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-09 14:08:18
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from 'sdk/models';

type MessageInputProps = {
  id: number; // group id
  onPost?: () => void;
};

type MessageInputViewProps = {
  id: number;
  draft: string;
  error: string;
  forceSaveDraft(): void;
  changeDraft(value: any): void;
  updateAttachmentItems(items: Item[]): void;
  keyboardEventHandler: {
    enter: {
      key: number;
      handler: () => void;
    };
  };
};

export { MessageInputProps, MessageInputViewProps };
