/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-09 14:08:18
 * Copyright © RingCentral. All rights reserved.
 */

type OnPostCallback = () => void;

type MessageInputProps = {
  id: number; // group id
  onPost?: () => void;
};

type MessageInputViewProps = {
  id: number;
  draft: string;
  error: string;
  forceSaveDraft(): void;
  addOnPostCallback(callback: OnPostCallback): void;
  contentChange(draft: string): void;
  keyboardEventHandler: {
    enter: {
      key: number;
      handler: () => void;
    };
  };
};

export { MessageInputProps, MessageInputViewProps, OnPostCallback };
