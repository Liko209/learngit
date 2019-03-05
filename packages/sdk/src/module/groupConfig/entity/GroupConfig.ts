/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 18:01:31
 * Copyright © RingCentral. All rights reserved.
 */

export type GroupConfig = {
  id: number; // group id
  has_more_older?: boolean;
  has_more_newer?: boolean;
  is_newest_saved?: boolean;
  draft?: string;
  attachment_item_ids?: number[];
  send_failure_post_ids?: number[];
  last_index_of_files?: number;
  last_index_of_tasks?: number;
  last_index_of_events?: number;
  last_index_of_notes?: number;
  last_index_of_links?: number;
};
