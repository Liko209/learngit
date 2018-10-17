/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { setUp, tearDown } from '../../libs/helpers';
import { directLogin, createPrivateChat } from '../../utils';
import { setupSDK } from '../../utils/setupSDK';
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
    groupId1 = await createPrivateChat(h, [h.users.user701.rc_id, h.users.user702.rc_id]);
    h.log(`1.1 create private chat id ${groupId1} A, and show in conversation list`);
    groupId2 = await createPrivateChat(h, [h.users.user701.rc_id, h.users.user703.rc_id]);
    h.log(`1.2 create private chat id ${groupId2} B, and show in conversation list`);
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
