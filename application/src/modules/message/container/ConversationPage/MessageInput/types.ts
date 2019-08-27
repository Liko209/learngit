/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-09 14:08:18
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { DeltaStatic } from 'quill';
import { SendTrigger } from '@/AnalyticsCollector/types';

type OnPostCallback = () => void;

type MessageInputProps = {
  id: number; // group id
  onPost?: () => void;
  viewRef: React.RefObject<any>;
  onUpArrowPressed: (content: string) => void;
};

type MessageInputViewProps = {
  draft: string;
  error: string;
  hasInput: boolean;
  forceSaveDraft(): void;
  forceSendPost(): void;
  addOnPostCallback(callback: OnPostCallback): void;
  contentChange(draft: string): void;
  insertEmoji(emoji: any, cb?: Function): void;
  cellWillChange(newGroupId: number, oldGroupId: number): void;
  hasFocused: boolean;
  keyboardEventHandler: {
    enter: {
      key: number;
      handler: () => void;
    };
  };
  handleContentSent: (trigger: SendTrigger, contents: DeltaStatic) => void;
};

export { MessageInputProps, MessageInputViewProps, OnPostCallback };
