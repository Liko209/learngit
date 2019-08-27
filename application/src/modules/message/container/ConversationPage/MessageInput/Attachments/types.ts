/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-11 09:44:47
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from 'sdk/module/item/entity';
import { ItemInfo } from 'jui/pattern/MessageInput/AttachmentList';

type AttachmentItem = {
  item: Item;
  data: File;
};

type SelectFile = {
  data: File;
  duplicate: boolean;
};

type AttachmentsProps = {
  id: number;
  onPostClicked?: () => void;
  viewRef?: React.RefObject<any>;
  forceSaveDraft: boolean;
};

type DidUploadFileCallback = () => Promise<void>;

type AttachmentsViewProps = {
  files: ItemInfo[];
  duplicateFiles: File[];
  showDuplicateFiles: boolean;
  canPost: boolean;
  autoUploadFiles: (
    files: File[],
    checkDuplicate?: boolean,
    callback?: DidUploadFileCallback,
  ) => Promise<void>;
  cancelUploadFile: (info: ItemInfo) => void;
  cancelDuplicateFiles: () => void;
  uploadDuplicateFiles: () => void;
  updateDuplicateFiles: () => void;
  onEscTrackedCancelDuplicateFiles: () => void;
  cleanFiles: () => void;
  reloadFiles: () => void;
  sendFilesOnlyPost: () => Promise<void>;
  dispose: () => void;
  forceSaveDraftItems: () => void;
};

export {
  AttachmentsProps,
  AttachmentsViewProps,
  AttachmentItem,
  SelectFile,
  DidUploadFileCallback,
};
