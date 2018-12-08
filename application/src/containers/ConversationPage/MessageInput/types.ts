/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-09 14:08:18
 * Copyright © RingCentral. All rights reserved.
 */

type MessageInputProps = {
  id: number; // group id
  onPost?: () => void;
};

type MessageInputViewProps = {
  id: number;
  draft: string;
  error: string;
  forceSaveDraft(): void;
  autoUploadFile(files: File[]): void;
  isFileExists(file: File): Promise<boolean>;
  cancelUploadFile(file: File): void;
  changeDraft(value: any): void;
  uploadDuplicateFiles(): void;
  cancelDuplicateFiles(): void;
  updateDuplicateFiles(): void;
  files: File[];
  duplicateFiles: File[];
  keyboardEventHandler: {
    enter: {
      key: number;
      handler: () => void;
    };
  };
};

export { MessageInputProps, MessageInputViewProps };
