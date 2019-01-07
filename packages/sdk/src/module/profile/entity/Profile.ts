/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-28 14:53:00
 * Copyright © RingCentral. All rights reserved.
 */

import { ExtendedBaseModel } from '../../models';

export type Profile = ExtendedBaseModel & {
  person_id?: number;
  favorite_group_ids: number[];
  favorite_post_ids: number[];
  skip_close_conversation_confirmation?: boolean;
  me_tab: boolean;
  max_leftrail_group_tabs2?: number;
};
