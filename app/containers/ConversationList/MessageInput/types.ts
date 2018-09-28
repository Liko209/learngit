/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import { TranslationFunction } from 'i18next';

type MessageInputProps = {
  id: number; // group id
};

type MessageInputViewProps = {
  id: number;
  draft: string;
  error: string;
  t?: TranslationFunction;
  init(id: number): void;
  forceSaveDraft(): void;
  changeDraft(value: any): void;
  keyboardEventHandler: {
    enter: {
      key: number;
      handler: () => void;
    };
  }
};

export { MessageInputProps, MessageInputViewProps };
