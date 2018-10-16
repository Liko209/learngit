/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { setUp, tearDown } from '../../libs/helpers';
import { directLogin, createPrivateChat } from '../../utils';
import { setupSDK } from '../../utils/setupSDK';
import { ProfileAPI, PersonAPI } from '../../libs/sdk';
import { Send } from '../../page-models/components/MessageInput';

fixture('send messages draft')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(formalName('draft', ['P0', 'JPT-139', 'Show massage draft when switching conversation']), async (t) => {
  await setupSDK(t);
  let groupId1: number;
  let groupId2: number;
  const msg = `${Date.now()}`; // Have a trap, no spaces
  const chain = directLogin(t).chain(async (t, h) => {
    const privateChat1 = await createPrivateChat(h, [h.users.user701.rc_id, h.users.user702.rc_id]);
    groupId1 = privateChat1.data.id;
    const profileId1 = (await PersonAPI.requestPersonById(h.users.user701.glip_id)).data.profile_id;
    await (ProfileAPI as any).putDataById(profileId1, { [`hide_group_${groupId1}`]: false });
    h.log(`1.1 create A private chat conversation id ${groupId1}, and show to left rail`);
    const privateChat2 = await createPrivateChat(h, [h.users.user701.rc_id, h.users.user703.rc_id]);
    groupId2 = privateChat2.data.id;
    const profileId2 = (await PersonAPI.requestPersonById(h.users.user701.glip_id)).data.profile_id;
    await (ProfileAPI as any).putDataById(profileId2, { [`hide_group_${groupId2}`]: false });
    h.log(`1.2 create B private chat conversation id ${groupId2}, and show to left rail`);
  });
  await chain;
  await chain.shouldNavigateTo(Send)
    .log(`2.1 select A conversation id ${groupId1}`)
    .selectConversation(groupId1)
    .log('2.2 expect editor has existed')
    .expectEditorHasExisted()
    .log('2.3 typing message')
    .inputMessage(msg)
    .log(`3.1 select B conversation id ${groupId2}`)
    .selectConversation(groupId2)
    .log('3.2 expect editor has existed')
    .expectEditorHasExisted()
    .log(`3.3 expect conversation id ${groupId1} show draft tag in conversation list`)
    .expectShowDraftTag(groupId1)
    .log(`4.1 select A conversation id ${groupId1}`)
    .selectConversation(groupId1)
    .log('4.2 expect editor has existed')
    .expectEditorHasExisted()
    .log('4.3 expect show message')
    .expectShowMessageInMessageInput(msg);
});
