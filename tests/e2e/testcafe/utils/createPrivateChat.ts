/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-16 15:02:52
 * Copyright © RingCentral. All rights reserved.
 */

import { TestHelper } from '../libs/helpers';

const createPrivateChat = async (h: TestHelper, members: any[]) => {
  const client701 = await h.glipApiManager.getClient(h.users.user701, h.companyNumber);
  const privateChat = await client701.createGroup({
    members,
    type: 'PrivateChat',
    isPublic: true,
    description: 'test',
  });
  // h.log(`   Private chat ${privateChat.data.id} is created.`);
  return privateChat;
};

export { createPrivateChat };
