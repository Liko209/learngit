/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-11 09:44:47
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from 'sdk/models';
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
};

type AttachmentsViewProps = {
  files: ItemInfo[];
  duplicateFiles: File[];
  showDuplicateFiles: boolean;
  autoUploadFiles: (files: File[]) => void;
  cancelUploadFile: (info: ItemInfo) => void;
  cancelDuplicateFiles: () => void;
  uploadDuplicateFiles: () => void;
  updateDuplicateFiles: () => void;
  cleanFiles: () => void;
  reloadFiles: () => void;
  dispose: () => void;
};

export { AttachmentsProps, AttachmentsViewProps, AttachmentItem, SelectFile };
