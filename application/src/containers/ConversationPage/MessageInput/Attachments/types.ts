/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-11 09:44:47
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from 'sdk/models';
import { ItemInfo } from 'jui/pattern/MessageInput/AttachmentList';

type AttachmentsObserverFunc = (items: Item[]) => void;

type AttachmentsProps = {
  id: number;
  attachmentsObserver: AttachmentsObserverFunc;
};

type AttachmentsViewProps = {
  files: ItemInfo[];
  duplicateFiles: ItemInfo[];
  items: Item[];
  autoUploadFiles: (files: File[]) => void;
  cancelUploadFile: (info: ItemInfo) => void;
  cancelDuplicateFiles: () => void;
  uploadDuplicateFiles: () => void;
  updateDuplicateFiles: () => void;
};

export { AttachmentsProps, AttachmentsViewProps, AttachmentsObserverFunc };
