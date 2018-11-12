/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-08 10:09:31
 * Copyright © RingCentral. All rights reserved.
 */
import ItemModel from '../Item';

type FileItem = {
  type: string;
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

type LinkItem = {
  summary: string;
  title: string;
  url: string;
  image: string;
  deactivated: boolean;
  doNotRender: boolean;
} & ItemModel;

export { FileItem, LinkItem };
