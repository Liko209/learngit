/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-16 15:02:52
 * Copyright © RingCentral. All rights reserved.
 */

import { TestHelper } from '../libs/helpers';
import { ProfileAPI, PersonAPI } from '../libs/sdk';

const createPrivateChat = async (h: TestHelper, members: any[]) => {
  const client701 = await h.glipApiManager.getClient(h.users.user701, h.companyNumber);
  const privateChat = await client701.createGroup({
    members,
    type: 'PrivateChat',
    isPublic: true,
    description: 'test',
  });
  const groupId = privateChat.data.id;
  // h.log(`   private chat id ${groupId} is created.`);
  const profileId = (await PersonAPI.requestPersonById(h.users.user701.glip_id)).data.profile_id;
  await (ProfileAPI as any).putDataById(profileId, { [`hide_group_${groupId}`]: false });
  // h.log(`   private chat id ${groupId} show in conversation list.`);
  return groupId;
};

export { createPrivateChat };
