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
  id: number;
  draft: string;
  error: string;
  forceSaveDraft(): void;
  forceSendPost(): void;
  changeDraft(value: any): void;
  addOnPostCallback(callback: OnPostCallback): void;
  keyboardEventHandler: {
    enter: {
      key: number;
      handler: () => void;
    };
  };
};

export { MessageInputProps, MessageInputViewProps, OnPostCallback };
