/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper } from '../../libs/helpers';
import { directLogin } from '../../utils';
import { setupSDK } from '../../utils/setupSDK';
import { ProfileAPI, PersonAPI } from '../../libs/sdk';
import { Send } from '../../page-models/components/MessageInput';
import { Selector } from 'testcafe';

fixture('send messages')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

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

test(formalName('send', ['P1', 'JPT-77', 'Enter text in the conversation input box']), async (t) => {
  await setupSDK(t);
  let groupId: number;
  const msg = `${Date.now()}`; // Have a trap, no spaces
  await directLogin(t)
    .chain(async (t, h) => {
      h.log('1. create one private chat conversation');
      const privateChat = await createPrivateChat(h, [h.users.user701.rc_id, h.users.user702.rc_id]);
      groupId = privateChat.data.id;
      h.log('2. show this private chat conversation to left rail');
      const profileId = (await PersonAPI.requestPersonById(h.users.user701.glip_id)).data.profile_id;
      await (ProfileAPI as any).putDataById(profileId, {
        [`hide_group_${groupId}`]: false,
      });
    })
    .chain(async (t, h) => {
      h.log(`3. select this conversation ${groupId}`);
      const selectorConversation = Selector(`[data-group-id="${groupId}"]`);
      return t.click(selectorConversation);
    })
    .shouldNavigateTo(Send)
    .log('4. ensure editor has loaded')
    .ensureLoaded()
    .log('5. typing message')
    .inputMessage(msg)
    .log('6. send message')
    .sendMessage()
    .log('7. expect show message')
    .expectShowMessage(msg);
});
