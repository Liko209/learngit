/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 13:13:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ExtendedBaseModel } from '../../models';
import { Raw, IdModel } from '../../../framework/model';

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

export type TaskItem = Item & {
  color: string;
  complete: boolean;
  notes: string;
  start: number;
  end: number;
  section: string;
  repeat: string;
  repeat_ending: string;
  repeat_ending_after: string;
  repeat_ending_on: string;
  text: string;
  due: number;
  complete_type: string;
  assigned_to_ids: number[];
  complete_people_ids: number[];
  attachment_ids: number[];
  complete_percentage: number;
};

export type EventItem = Item & {
  color: string;
  description: string;
  start: number;
  end: number;
  location: string;
  repeat: string;
  repeat_ending: string;
  repeat_ending_after: string;
  repeat_ending_on: string;
  text: string;
};

export type ItemFile = Item & {
  name: string;
};

export type NoteItem = Item & {
  body: string;
  title: string;
  summary: string;
};

export type LinkItem = Item & {
  favicon: string;
  providerName: string;
  summary: string;
  title: string;
  url: string;
  image: string;
  data: {
    provider_name: string;
  };
};

export type StoredFile = Raw<ExtendedBaseModel> & {
  storage_url: string;
  download_url: string;
  storage_path: string;
  last_modified: number;
  size: number;
};

type SanitizedItem = IdModel & {
  group_ids: number[];
  created_at: number;
  name: string;
};

export type SanitizedFileItem = SanitizedItem & {
  type: string;
};

export type SanitizedTaskItem = SanitizedItem & {};

export type SanitizedNoteItem = SanitizedItem & {};

export type SanitizedEventItem = SanitizedItem & {};

export type SanitizedLinkItem = SanitizedItem & {};
