/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-09 14:08:18
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

type OnPostCallback = () => void;

type MessageInputProps = {
  id: number; // group id
  onPost?: () => void;
  viewRef: React.RefObject<any>;
};

type MessageInputViewProps = {
  draft: string;
  error: string;
  forceSaveDraft(): void;
  forceSendPost(): void;
  addOnPostCallback(callback: OnPostCallback): void;
  contentChange(draft: string): void;
  insertEmoji(emoji: any, cb?: Function): void;
  cellWillChange(newGroupId: number, oldGroupId: number): void;
  keyboardEventHandler: {
    enter: {
      key: number;
      handler: () => void;
    };
  };
};

export { MessageInputProps, MessageInputViewProps, OnPostCallback };
