/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-1-3 10:20:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ExtendedBaseModel } from '../../../../models';
import { Raw } from '../../../../../framework/model';

export type ItemVersionPage = {
  file_id: number;
  url: string;
};

export type ItemVersions = {
  download_url: string;
  size: number;
  url: string;
  thumbs?: any;
  length?: number; // document preview
  orig_height?: number;
  orig_width?: number;
  pages?: ItemVersionPage[];
  stored_file_id: number;
};

export type Item = ExtendedBaseModel & {
  group_ids: number[];
  post_ids: number[];
  company_id: number;
  is_document?: boolean;
  name: string; // file name
  type_id: number; // file type
  type: string; // file type .jpg .exe
  versions: ItemVersions[];
  summary?: string;
  title?: string;
  url?: string;
  image?: string;
  do_not_render?: boolean;
};

export type StoredFile = Raw<ExtendedBaseModel> & {
  storage_url: string;
  download_url: string;
  storage_path: string;
  last_modified: number;
  size: number;
};
