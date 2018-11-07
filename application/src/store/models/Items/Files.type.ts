/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-07 16:37:30
 * Copyright © RingCentral. All rights reserved.
 */
import ItemModel from '../Item';

type FileItem = {
  type: string;
  typeId: number;
  downloadUrl: string;
  size: number;
  name: string;
  isDocument: boolean;
  isNew: boolean;
  url: string;
  pages: {
    file_id: number;
    url: string;
  }[];
  thumbs: any;
  origHeight: number;
  origWidth: number;
} & ItemModel;

export { FileItem };
